import InterviewSessionModel, { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import profileRepository from "../repositories/profile.repository.ts";
import { RequestMatchServiceInput } from "../types/match.types.ts";
import { getOnlineUsers, emitToUser } from "../socket/index.ts";
import { MatchingEngine } from "../engine/matching.engine.ts";
import { MATCH_QUEUE } from "../constants/match.constants.ts";
import { AppError } from "../utils/appError.ts";
import { randomUUID } from "crypto";
import { Types } from "mongoose";

export const requestMatchService = async (input: RequestMatchServiceInput) => {
    const userObjectId = new Types.ObjectId(input.userId);
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

    await MatchRepository.expireOldRequests(new Date(Date.now() - MATCH_QUEUE.REQUEST_EXPIRY_MINUTES * 60000));
    
    const request = await MatchRepository.createMatchRequest({ userId: userObjectId, ...input.data });

    // Find eligible online candidates
    const onlineUsersMap = getOnlineUsers();
    const onlineUserIds = Array.from(onlineUsersMap.keys());
    
    // Get all profiles of online users
    const onlineProfiles = await profileRepository.findManyByUserIds(onlineUserIds);

    // Get active sessions to know who is busy
    const activeSessions = await InterviewSessionModel.find({
        status: { $in: [InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.ACTIVE] }
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

        // Notify them in real-time
        for (const candidate of eligibleUserIds) {
            emitToUser(candidate.toString(), "interview-request", {
                requestId: request._id,
                interviewType: request.interviewType,
                preferredLanguage: request.preferredLanguage,
                duration: request.duration,
                requesterHeadline: profile.headline,
            });
        }
    }

    return request;
};

export const acceptMatchService = async (userId: string, requestId: string) => {
    const requestObjectId = new Types.ObjectId(requestId);
    const userObjectId = new Types.ObjectId(userId);

    const sessionId = new Types.ObjectId();

    const request = await MatchRepository.acceptMatchRequestAtomically(
        requestObjectId,
        userObjectId,
        sessionId
    );

    if (!request) {
        throw new AppError("Request is no longer available or already accepted.", 400);
    }

    // Create session
    const roomId = randomUUID();
    const session = await InterviewSessionModel.create({
        _id: sessionId,
        matchId: requestObjectId,
        interviewerId: userObjectId,
        intervieweeId: request.userId,
        status: InterviewSessionStatus.SCHEDULED,
        roomId,
    });

    // Notify requester
    emitToUser(request.userId.toString(), "interview-assigned", {
        requestId,
        sessionId: session._id,
        interviewerId: userObjectId,
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

    return { message: "Rejected successfully" };
};