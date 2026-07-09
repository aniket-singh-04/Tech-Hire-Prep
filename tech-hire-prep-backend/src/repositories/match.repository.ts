import { Types } from "mongoose";
import { IInterview, matchStatus } from "../types/match.types.ts";
import InterviewRequestModel from "../models/match.model.ts";

type InterviewRequest = Pick<IInterview, | "userId" | "interviewType" | "preferredRole" | "difficulty" | "preferredLanguage" | "duration">;

export class MatchRepository {

  static async createMatchRequest(data: InterviewRequest) {
    return InterviewRequestModel.create(data);
  }

  static async findActiveRequestByUserId(
    userId: Types.ObjectId
  ) {
    return InterviewRequestModel.findOne({
      userId,
      status: matchStatus.SEARCHING,
    });
  }

  static async findRequestById(
    id: Types.ObjectId
  ) {
    return InterviewRequestModel.findById(id);
  }

  static async findWaitingRequests() {
    return InterviewRequestModel.find({
      status: matchStatus.SEARCHING,
    });
  }

  static async updateRequestStatus(
    requestId: Types.ObjectId,
    status: matchStatus
  ) {
    return InterviewRequestModel.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );
  }

  static async deleteRequest(
    requestId: Types.ObjectId
  ) {
    return InterviewRequestModel.findByIdAndDelete(requestId);
  }

  static async findCompatibleCandidates(data: InterviewRequest) {
    // prefered role 
    return InterviewRequestModel.find({
      userId: { $ne: data.userId },
      status: matchStatus.SEARCHING,
      interviewType: data.interviewType,
    });
  }

  static async countSearchingRequests() {
    return InterviewRequestModel.countDocuments({
      status: matchStatus.SEARCHING,
    });
  }

  static async expireOldRequests(before: Date) {
    return InterviewRequestModel.updateMany(
      {
        status: matchStatus.SEARCHING,
        createdAt: { $lt: before },
      },
      {
        status: matchStatus.EXPIRED,
      }
    );
  }
}