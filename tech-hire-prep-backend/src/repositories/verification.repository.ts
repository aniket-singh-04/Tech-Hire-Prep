import { Types } from "mongoose";
import { EmailVerificationTokenModel } from "../models/emailVerificationToken.model.ts";
import { VerificationPurpose } from "../types/emailverify.type.ts";

export class VerificationRepo {
    // 1. CREATE verification record
    static async create(data: {
        userId?: Types.ObjectId;
        codeHash: string;
        expiresAt: Date;
        purpose: VerificationPurpose;

    }) {
        return EmailVerificationTokenModel.create({
            userId: data.userId,
            tokenHash: data.codeHash,
            expiresAt: data.expiresAt,
            purpose: data.purpose
        });
    }

    // 2. FIND active verification
    // static async findActive(email: string, purpose: Purpose) {
    //     return EmailVerificationTokenModel.findOne({
    //         email,
    //         purpose,
    //         consumedAt: null,
    //     });
    // }

    // 3. FIND BY ID
    static async findById(id: string) {
        return EmailVerificationTokenModel.findById(id);
    }

    // 4. INCREMENT ATTEMPTS
    static async incrementAttempts(id: string) {
        return EmailVerificationTokenModel.findByIdAndUpdate(
            id,
            {
                $inc: { attempts: 1 },
            },
            { new: true }
        );
    }

    // 5. MARK AS CONSUMED (verified)
    static async markConsumed(id: string) {
        return EmailVerificationTokenModel.updateOne(
            {
                _id: id,
                consumedAt: null,
            },
            {
                $set: {
                    consumedAt: new Date(),
                },
            }
        );
    }

    // 6. DELETE ACTIVE VERIFICATIONS (resend flow)
    static async deleteActive(input: {
        userId: string;
        purpose: VerificationPurpose;
    }) {
        return EmailVerificationTokenModel.deleteMany({
            userId: new Types.ObjectId(input.userId),
            purpose: input.purpose,
            consumedAt: null,
        });
    }

    // 7. RESEND COUNT INCREMENT
    static async incrementResendCount(id: string) {
        return EmailVerificationTokenModel.findByIdAndUpdate(
            id,
            {
                $inc: { resendCount: 1 },
            },
            { new: true }
        );
    }

    static async findActiveByToken(data: {
        userId: string;
        purpose: VerificationPurpose;
        codeHash: string;
    }) {
        return EmailVerificationTokenModel.findOne({
            userId: new Types.ObjectId(data.userId),
            purpose: data.purpose,
            codeHash: data.codeHash,
            consumedAt: null,
            expiresAt: { $gt: new Date() },
        });
    }

    // 8. SAVE (if using document method)
    static async save(doc: any) {
        return doc.save();
    }
}