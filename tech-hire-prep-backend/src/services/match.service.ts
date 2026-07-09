import { Types } from "mongoose";
import { RequestMatchServiceInput } from "../types/match.types.ts";
import profileRepository from "../repositories/profile.repository.ts";
import { AppError } from "../utils/appError.ts";
import { MatchingEngine } from "../engine/matching.engine.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import { MATCH_QUEUE } from "../constants/match.constants.ts";

export const requestMatchService = async (input: RequestMatchServiceInput) => {
    const userObjectId = new Types.ObjectId(input.userId);
    const profile = await profileRepository.findByUserId(input.userId);

    if (!profile) {
        throw new AppError("First create you profile.", 404);
    }

    if (profile.profileCompletion > 75) {
        throw new AppError("Complete your profile before requesting a match.", 404);
    }
    const active = await MatchRepository.findActiveRequestByUserId(userObjectId);

    if (active) {
        throw new AppError("You already have an active matchmaking request.", 409);
    }

    await MatchRepository.expireOldRequests(new Date(Date.now() - MATCH_QUEUE.REQUEST_EXPIRY_MINUTES * 60000));
    const request = await MatchRepository.createMatchRequest({ userId: userObjectId, ...input.data });
    const candidates = await MatchRepository.findCompatibleCandidates(userObjectId, request.interviewType);
    const result = MatchingEngine.findBestMatch(request, candidates);
    return request;
}