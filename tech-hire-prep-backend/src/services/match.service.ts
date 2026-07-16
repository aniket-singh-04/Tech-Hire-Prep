import InterviewSessionModel, { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import profileRepository from "../repositories/profile.repository.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { RequestMatchServiceInput, matchStatus } from "../types/match.types.ts";
import { getOnlineUsers, emitToUser } from "../socket/index.ts";
import { MatchingEngine } from "../engine/matching.engine.ts";
import { MATCH_QUEUE } from "../constants/match.constants.ts";
import { AppError } from "../utils/appError.ts";
import { randomUUID } from "crypto";
import { Types } from "mongoose";

export const requestMatchService = async (input: RequestMatchServiceInput) => {
    const userObjectId = new Types.ObjectId(input.userId);
    const requester = await UserRepository.findById(input.userId);
    const profile = await profileRepository.findByUserId(input.userId);

    if (!profile) {
        throw new AppError("First create your profile.", 404);
    }

    if (profile.profileCompletion < 75) {
        throw new AppError("Complete your profile before requesting a match.", 400);
    }

    const active = await MatchRepository.findActiveRequestByUserId(userObjectId);

    if (active) {
        throw new AppError("You already have an active matchmaking request.", 409);
    }

    const expiresAt = new Date(Date.now() + MATCH_QUEUE.REQUEST_EXPIRY_MINUTES * 60000);
    await MatchRepository.expireOldRequests(new Date(Date.now() - MATCH_QUEUE.REQUEST_EXPIRY_MINUTES * 60000));

    const request = await MatchRepository.createMatchRequest({
        userId: userObjectId,
        ...input.data,
        expirationTimestamp: expiresAt,
    } as never);

    // Find eligible online candidates
    // const onlineUsersMap = getOnlineUsers();
    // const onlineUserIds = Array.from(onlineUsersMap.keys());
    const allUsers = await profileRepository.othersCandidateProfile(input.userId);
    const onlineUserIds = allUsers.map(user => user.userId.toString());
    console.log(onlineUserIds)
    
    // Get all profiles of online users
    const onlineProfiles = await profileRepository.findManyByUserIds(onlineUserIds);
    console.log(onlineProfiles)
    
    // Get active sessions to know who is busy
    const activeSessions = await InterviewSessionModel.find({
        status: { $in: [InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.READY, InterviewSessionStatus.JOINED, InterviewSessionStatus.ACTIVE] }
    });
    console.log(activeSessions)

    const busyUserIds = new Set<string>();
    for (const session of activeSessions) {
        busyUserIds.add(session.interviewerId.toString());
        busyUserIds.add(session.intervieweeId.toString());
    }

    const eligibleProfiles = MatchingEngine.filterEligibleCandidates(
        request,
        profile,
        onlineProfiles,
        Array.from(busyUserIds)
    );
    console.log(eligibleProfiles)

    if (eligibleProfiles.length > 0) {
        const eligibleUserIds = eligibleProfiles.map(p => p.userId);
        await MatchRepository.addNotifiedUsers(request._id as Types.ObjectId, eligibleUserIds);

        // Notify them in real-time with full request context so they can make an informed decision
        for (const candidate of eligibleUserIds) {
            emitToUser(candidate.toString(), "interview-request", {
                requestId: request._id,
                requesterId: input.userId,
                requesterName: requester?.name ?? null,
                interviewType: request.interviewType,
                preferredRole: request.preferredRole,
                difficulty: request.difficulty,
                preferredLanguage: request.preferredLanguage,
                duration: request.duration,
                description: request.description ?? null,
                requesterHeadline: profile.headline,
                expiresAt,
            });
        }
    }

    return request;
};


const isWithinAvailability = (availability: { day: string; startTime: string; endTime: string }[] | undefined) => {
    if (!availability || availability.length === 0) return true;

    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase();
    const currentTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

    const todaySlots = availability.filter((slot) => slot.day === currentDay);
    if (todaySlots.length === 0) return false;

    return todaySlots.some((slot) => currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime);
};

const buildBusyUserSet = async () => {
    const activeSessions = await InterviewSessionModel.find({
        status: { $in: [InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.READY, InterviewSessionStatus.JOINED, InterviewSessionStatus.ACTIVE] }
    });

    const busyUserIds = new Set<string>();
    for (const session of activeSessions) {
        busyUserIds.add(session.interviewerId.toString());
        busyUserIds.add(session.intervieweeId.toString());
    }

    return busyUserIds;
};

const ensureAcceptEligibility = async (request: any, userId: string) => {
    if (request.userId.toString() === userId) {
        throw new AppError("You cannot accept your own request.", 400);
    }

    if (request.expirationTimestamp && new Date(request.expirationTimestamp).getTime() < Date.now()) {
        throw new AppError("This request has expired.", 400);
    }

    const candidateProfile = await profileRepository.findByUserId(userId);
    const requesterProfile = await profileRepository.findByUserId(request.userId.toString());

    if (!candidateProfile || !requesterProfile) {
        throw new AppError("Profile not found.", 404);
    }

    if (candidateProfile.profileCompletion < 75) {
        throw new AppError("Complete your profile before accepting a match.", 400);
    }

    if (candidateProfile.profileCompletion < requesterProfile.profileCompletion) {
        throw new AppError("Your profile must be at least as complete as the requester profile.", 403);
    }

    if (candidateProfile.targetRole !== request.preferredRole) {
        throw new AppError("This request does not match your target role.", 403);
    }

    if (!isWithinAvailability(candidateProfile.availability as { day: string; startTime: string; endTime: string }[] | undefined)) {
        throw new AppError("You are not available right now.", 403);
    }

    const busyUserIds = await buildBusyUserSet();
    if (busyUserIds.has(userId)) {
        throw new AppError("You already have an active session.", 409);
    }

    return { candidateProfile, requesterProfile };
};

export const getVisibleMatchRequestService = async (userId: string) => {
    const candidateProfile = await profileRepository.findByUserId(userId);
    if (!candidateProfile) return null;
    
    if (candidateProfile.profileCompletion < 75) return null;
    
    const activeRequests = await MatchRepository.findSearchingRequests();
    if (activeRequests.length === 0) return null;

    const busyUserIds = await buildBusyUserSet();
    const candidateBusy = busyUserIds.has(userId);
    if (candidateBusy) return null;

    console.log(activeRequests)
    for (const request of activeRequests) {
        if (request.userId.toString() === userId) continue;
        if (request.expirationTimestamp && new Date(request.expirationTimestamp).getTime() < Date.now()) continue;

        const requesterProfile = await profileRepository.findByUserId(request.userId.toString());
        if (!requesterProfile) continue;
        if (candidateProfile.profileCompletion < requesterProfile.profileCompletion) continue;
        if (candidateProfile.targetRole !== request.preferredRole) continue;
        if (!isWithinAvailability(candidateProfile.availability as { day: string; startTime: string; endTime: string }[] | undefined)) continue;

        return request;
    }

    return null;
};
export const acceptMatchService = async (userId: string, requestId: string) => {
    const requestObjectId = new Types.ObjectId(requestId);
    const userObjectId = new Types.ObjectId(userId);

    const request = await MatchRepository.findRequestById(requestObjectId);
    if (!request) {
        throw new AppError("Request not found.", 404);
    }

    await ensureAcceptEligibility(request, userId);

    const sessionId = new Types.ObjectId();
    const roomId = randomUUID();

    const accepted = await MatchRepository.acceptMatchRequestAtomically(
        requestObjectId,
        userObjectId,
        sessionId
    );

    if (!accepted) {
        throw new AppError("Request is no longer available or already accepted.", 400);
    }

    const session = await InterviewSessionModel.create({
        _id: sessionId,
        matchId: requestObjectId,
        interviewerId: userObjectId,
        intervieweeId: request.userId,
        status: InterviewSessionStatus.CREATED,
        roomId,
    });

    emitToUser(request.userId.toString(), "interview-assigned", {
        requestId,
        sessionId: session._id,
        interviewerId: userObjectId,
        roomId,
        matchDetails: {
            interviewType: request.interviewType,
            preferredRole: request.preferredRole,
            difficulty: request.difficulty,
            preferredLanguage: request.preferredLanguage,
            duration: request.duration,
            description: request.description ?? null,
        },
    });

    const otherNotifiedUsers = request.notifiedUsers?.filter(
        nu => nu.userId.toString() !== userId && nu.status === "PENDING"
    ) || [];

    for (const nu of otherNotifiedUsers) {
        emitToUser(nu.userId.toString(), "interview-closed", {
            requestId
        });
    }

    return session;
};

export const rejectMatchService = async (userId: string, requestId: string) => {
    const requestObjectId = new Types.ObjectId(requestId);
    const userObjectId = new Types.ObjectId(userId);

    const updated = await MatchRepository.rejectMatchRequest(requestObjectId, userObjectId);
    if (!updated) {
        throw new AppError("Request not found.", 404);
    }

    const allResponded = (updated.notifiedUsers?.length ?? 0) > 0 && updated.notifiedUsers?.every(n => n.status !== "PENDING");
    if (allResponded && updated.status === matchStatus.SEARCHING) {
        await MatchRepository.updateRequestStatus(requestObjectId, matchStatus.EXPIRED, {
            expirationTimestamp: new Date(),
        });
    }

    return { message: "Rejected successfully" };
};

export const cancelMatchService = async (userId: string) => {
    const active = await MatchRepository.findActiveRequestByUserId(new Types.ObjectId(userId));

    if (!active) {
        throw new AppError("No active matchmaking request found.", 404);
    }

    const isOwner = active.userId.toString() === userId;
    if (!isOwner) {
        throw new AppError("Only the requester can cancel this match.", 403);
    }

    const updated = await MatchRepository.updateRequestStatus(active._id as Types.ObjectId, matchStatus.CANCELLED, {
        expirationTimestamp: new Date(),
    });

    if (updated?.interviewSessionId) {
        const session = await InterviewSessionModel.findByIdAndUpdate(
            updated.interviewSessionId,
            {
                $set: {
                    status: InterviewSessionStatus.CANCELLED,
                    endTime: new Date(),
                },
            },
            { returnDocument: "after" }
        );

        if (session) {
            const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
            emitToUser(otherUserId.toString(), "session-cancelled", { sessionId: session._id.toString() });
        }
    } else {
        for (const notified of active.notifiedUsers ?? []) {
            if (notified.status === "PENDING") {
                emitToUser(notified.userId.toString(), "interview-closed", { requestId: active._id.toString() });
            }
        }
    }

    return updated;
};








