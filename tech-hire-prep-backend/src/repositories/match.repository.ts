import { Types } from "mongoose";
import { IInterview, matchStatus } from "../types/match.types.ts";
import InterviewRequestModel from "../models/match.model.ts";

type InterviewRequestInput = Pick<IInterview, "userId" | "interviewType" | "preferredRole" | "difficulty" | "preferredLanguage" | "duration">;

export class MatchRepository {

  static async createMatchRequest(data: InterviewRequestInput) {
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

  static async updateRequestStatus(
    requestId: Types.ObjectId,
    status: matchStatus,
    extraUpdates: any = {}
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

  static async acceptMatchRequestAtomically(
    requestId: Types.ObjectId,
    acceptingUserId: Types.ObjectId,
    sessionId: Types.ObjectId
  ) {
    // Atomically find a request that is still SEARCHING, and the user is in notifiedUsers as PENDING
    // Then set it to ASSIGNED and lock it.
    return InterviewRequestModel.findOneAndUpdate(
      {
        _id: requestId,
        status: matchStatus.SEARCHING,
        "notifiedUsers.userId": acceptingUserId,
        "notifiedUsers.status": "PENDING"
      },
      {
        $set: {
          status: matchStatus.ASSIGNED,
          matchedUserId: acceptingUserId,
          interviewSessionId: sessionId,
          acceptedTime: new Date(),
          assignmentTimestamp: new Date(),
          "notifiedUsers.$.status": "ACCEPTED",
          "notifiedUsers.$.respondedAt": new Date()
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