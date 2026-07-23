import { Types } from "mongoose";
import InterviewSessionModel, { InterviewSessionStatus } from "../models/interviewSession.model.ts";

class InterviewSessionRepository {
  // Find active interview sessions
  async findActiveSessions() {
    return InterviewSessionModel.find({
      status: {
        $in: [
          InterviewSessionStatus.SCHEDULED,
          InterviewSessionStatus.READY,
          InterviewSessionStatus.JOINED,
          InterviewSessionStatus.ACTIVE,
        ],
      },
    });
  }

  // Create interview session
  async createSession(data: {
    _id: Types.ObjectId;
    matchId: Types.ObjectId;
    interviewerId: Types.ObjectId;
    intervieweeId: Types.ObjectId;
    status: InterviewSessionStatus;
    roomId: string;
  }) {
    return InterviewSessionModel.create(data);
  }

  // Cancel interview session
  async cancelSession(sessionId: Types.ObjectId) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          status: InterviewSessionStatus.CANCELLED,
          endTime: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );
  }

  // Find session by session id
  async findById(sessionId: Types.ObjectId) {
    return InterviewSessionModel.findById(sessionId);
  }

  // Find user's upcoming sessions
  async findUserSessions(userId: Types.ObjectId, page: number, limit: number) {
    return InterviewSessionModel.find({
      $or: [
        { interviewerId: userId },
        { intervieweeId: userId },
      ],
            status: {
        $in: [
          InterviewSessionStatus.SCHEDULED,
          InterviewSessionStatus.READY,
          InterviewSessionStatus.JOINED,
          InterviewSessionStatus.ACTIVE,
        ],
      },
    })
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  // Find session by id
  async findByIdWithPopulatedMatchId(sessionId: string) {
    return InterviewSessionModel.findById(sessionId).select("+startTime +endTime").populate("matchId");
  }

    // update schedule
  async updateSchedule(sessionId: Types.ObjectId, startTime: Date, endTime: Date, status: InterviewSessionStatus) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      { $set: { scheduledAt: startTime, startTime, endTime, status } },
      { returnDocument: "after" }
    );
  }

  // Remove code and language fields
  async clearCodeAndLanguage(sessionId: string) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $unset: {
          code: "",
          language: "",
        },
      },
      {
        returnDocument: "after",
      }
    );
  }

  // Find session by room id
  async findByRoomId(roomId: string) {
    return InterviewSessionModel.findOne({
      roomId,
    });
  }

  // session history find
  async findSessionHistory(userId: Types.ObjectId, page: number, limit: number) {
    return InterviewSessionModel.find({
      $or: [
        { interviewerId: userId },
        { intervieweeId: userId },
      ],
      status: {
        $in: [
          InterviewSessionStatus.COMPLETED,
          InterviewSessionStatus.CANCELLED,
        ],
      },
        })
      .sort({ endTime: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  // update session state
  async updateSessionStatus(
    sessionId: Types.ObjectId,
    data: Partial<{
      status: InterviewSessionStatus;
      interviewerJoinedAt: Date;
      intervieweeJoinedAt: Date;
      readyAt: Date;
      startTime: Date;
      endTime: Date;
    }>
  ) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: data,
      },
      {
        returnDocument: "after"
      }
    );
  }

  // update report
  async addReport(
    sessionId: Types.ObjectId,
    report: {
      userId: Types.ObjectId;
      reason: string;
      createdAt: Date;
    }
  ) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $push: {
          reports: report,
        },
      },
      {
        returnDocument: "after"
      }
    );
  }

  // rating
  async updateRatings(
    sessionId: Types.ObjectId,
    data: {
      ratings: {
        fromUserId: Types.ObjectId;
        toUserId: Types.ObjectId;
        value: number;
        createdAt: Date;
      }[];
    }
  ) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          ratings: data.ratings,
        },
      },
      {
        returnDocument: "after",
      }
    );
  }

  // feedback
  async updateFeedbackEntries(
    sessionId: Types.ObjectId,
    feedbackEntries: {
      fromUserId: Types.ObjectId;
      toUserId: Types.ObjectId;
      feedback: string;
      createdAt: Date;
    }[]
  ) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          feedbackEntries,
        },
      },
      {
        new: true,
      }
    );
  }

  // update code
  async updateCode(
    sessionId: Types.ObjectId,
    data: Partial<{
      code: string;
      language: string;
    }>
  ) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: data,
      },
      {
        returnDocument: "after",
      }
    );
  }

  // remove code and language
  async clearCode(sessionId: Types.ObjectId) {
    return InterviewSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $unset: {
          code: "",
          language: "",
        },
      },
      {
        returnDocument: "after",
      }
    );
  }
}

export default new InterviewSessionRepository();