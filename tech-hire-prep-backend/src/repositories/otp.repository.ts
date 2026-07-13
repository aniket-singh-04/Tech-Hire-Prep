import { OtpChallengeModel } from "../models/otpChallenge.model.ts";
import { OtpPurpose, UserRole } from "../types/user.types.ts";
import { Types } from "mongoose";

export class OtpRepository {
  static async create(data: {
    userId?: Types.ObjectId;
    purpose: OtpPurpose;
    email: string;
    codeHash: string;
    expiresAt: Date;

    pendingUser?: {
      name: string;
      email: string;
      passwordHash: string;
      role: UserRole;
    };

    metadata?: Record<string, unknown>;
  }) {
    return OtpChallengeModel.create({
      ...data,
      metadata: data.metadata ?? {},
    });
  }

  static async deleteActiveOtp(
    email: string,
    purpose: OtpPurpose,
  ) {
    return OtpChallengeModel.deleteMany({
      email,
      purpose,
      consumedAt: null,
    });
  }

  static async findById(id: string) {
    return OtpChallengeModel.findById(id);
  }

  // static async findActiveOtp(
  //   email: string,
  //   purpose: Purpose,
  // ) {
  //   return OtpChallengeModel.findOne({
  //     email,
  //     purpose,
  //     consumedAt: null,
  //   });
  // }

  // static async incrementAttempts(id: string) {
  //   return OtpChallengeModel.findByIdAndUpdate(
  //     id,
  //     {
  //       $inc: {
  //         attempts: 1,
  //       },
  //     },
  //     {
  //       returnDocument: "after",
  //     },
  //   );
  // }

  // static async markConsumed(id: string) {
  //   return OtpChallengeModel.findByIdAndUpdate(
  //     id,
  //     {
  //       consumedAt: new Date(),
  //     },
  //     {
  //       returnDocument: "after",
  //     },
  //   );
  // }

  static async save(challenge: InstanceType<typeof OtpChallengeModel>) {
    return challenge.save();
  }
} 