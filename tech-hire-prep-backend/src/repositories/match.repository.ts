import { Types } from "mongoose";
import { IInterview, matchStatus } from "../types/match.types.ts";
import InterviewRequestModel from "../models/match.model.ts";

type InterviewRequestInput = Pick<IInterview, "userId" | "interviewType" | "preferredRole" | "difficulty" | "preferredLanguage" | "duration">;

export class MatchRepository {
  static async createMatchRequest(data: InterviewRequestInput) {
    return InterviewRequestModel.create(data);
  }

  static async findSearchingRequests() {
    return InterviewRequestModel.find({ status: matchStatus.SEARCHING }).sort({ createdAt: -1 });
  }

  static async findActiveRequestByUserId(userId: Types.ObjectId) {
    return InterviewRequestModel.findOne({
      userId,
      status: { $in: [matchStatus.SEARCHING, matchStatus.ASSIGNED] },
    }).sort({ createdAt: -1 });
  }

  static async findVisibleActiveRequestByUserId(userId: Types.ObjectId) {
    return InterviewRequestModel.findOne({
      $or: [
        {
          userId,
          status: { $in: [matchStatus.SEARCHING, matchStatus.ASSIGNED] },
        },
        {
          status: matchStatus.SEARCHING,
          "notifiedUsers.userId": userId,
          "notifiedUsers.status": "PENDING",
        },
      ],
    }).sort({ createdAt: -1 });
  }

  static async findRequestById(id: Types.ObjectId) {
    return InterviewRequestModel.findById(id);
  }

  static async updateRequestStatus(
    requestId: Types.ObjectId,
    status: matchStatus,
    extraUpdates: Record<string, unknown> = {}
  ) {
    return InterviewRequestModel.findByIdAndUpdate(
      requestId,
      { $set: { status, ...extraUpdates } },
      { returnDocument: "after" }
    );
  }

  static async addNotifiedUsers(
    requestId: Types.ObjectId,
    userIds: Types.ObjectId[]
  ) {
    const newNotifiedUsers = userIds.map(userId => ({
      userId,
      status: "PENDING",
      notifiedAt: new Date()
    }));

    return InterviewRequestModel.findByIdAndUpdate(
      requestId,
      { $push: { notifiedUsers: { $each: newNotifiedUsers } } },
      { returnDocument: "after" }
    );
  }

  static async addNotifiedUser(
    requestId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return InterviewRequestModel.findOneAndUpdate(
      {
        _id: requestId,
        "notifiedUsers.userId": { $ne: userId },
      },
      {
        $push: {
          notifiedUsers: {
            userId,
            status: "PENDING",
            notifiedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );
  }

  static async acceptMatchRequestAtomically(
    requestId: Types.ObjectId,
    acceptingUserId: Types.ObjectId,
    sessionId: Types.ObjectId
  ) {
    return InterviewRequestModel.findOneAndUpdate(
      {
        _id: requestId,
        status: matchStatus.SEARCHING,
      },
      {
        $set: {
          status: matchStatus.ASSIGNED,
          matchedUserId: acceptingUserId,
          interviewSessionId: sessionId,
          acceptedTime: new Date(),
          assignmentTimestamp: new Date(),
        }
      },
      { returnDocument: "after" }
    );
  }

  static async rejectMatchRequest(
    requestId: Types.ObjectId,
    rejectingUserId: Types.ObjectId
  ) {
    return InterviewRequestModel.findOneAndUpdate(
      {
        _id: requestId,
        "notifiedUsers.userId": rejectingUserId,
      },
      {
        $set: {
          "notifiedUsers.$.status": "REJECTED",
          "notifiedUsers.$.respondedAt": new Date()
        }
      },
      { returnDocument: "after" }
    );
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
        $set: { status: matchStatus.EXPIRED }
      }
    );
  }
}

