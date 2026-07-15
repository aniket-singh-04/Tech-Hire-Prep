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
    const onlineUsersMap = getOnlineUsers();
    const onlineUserIds = Array.from(onlineUsersMap.keys());

    // Get all profiles of online users
    const onlineProfiles = await profileRepository.findManyByUserIds(onlineUserIds);

    // Get active sessions to know who is busy
    const activeSessions = await InterviewSessionModel.find({
        status: { $in: [InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.READY, InterviewSessionStatus.JOINED, InterviewSessionStatus.ACTIVE] }
    });
    
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

export const acceptMatchService = async (userId: string, requestId: string) => {
    const requestObjectId = new Types.ObjectId(requestId);
    const userObjectId = new Types.ObjectId(userId);

    const sessionId = new Types.ObjectId();
    const roomId = randomUUID();

    const request = await MatchRepository.acceptMatchRequestAtomically(
        requestObjectId,
        userObjectId,
        sessionId
    );

    if (!request) {
        throw new AppError("Request is no longer available or already accepted.", 400);
    }

    // Create session in CREATED state. Scheduling happens separately.
    const session = await InterviewSessionModel.create({
        _id: sessionId,
        matchId: requestObjectId,
        interviewerId: userObjectId,
        intervieweeId: request.userId,
        status: InterviewSessionStatus.CREATED,
        roomId,
    });

    // Notify requester with full context so they know who accepted and can prepare
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

    // Notify other candidates that the request is closed
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



