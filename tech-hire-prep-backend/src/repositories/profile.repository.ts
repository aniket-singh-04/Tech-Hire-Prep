import { UpdateQuery } from "mongoose";
import { Profile } from "../models/profile.model.ts";
import { IProfile } from "../types/profile.types.ts";

class ProfileRepository {
    async create(data: Partial<IProfile>) {
        return Profile.create(data);
    }

    async findById(profileId: string) {
        return Profile.findById(profileId);
    }

    async findByUserId(userId: string) {
        return Profile.findOne({ userId });
    }

    async findPublicProfile(username: string) {
        return Profile.findOne({ username }).select(
            "fullName username userId headline bio college branch graduationYear targetRole experienceLevel skills socialLinks isProfileCompleted createdAt updatedAt"
        );
    }

    async findManyByUserIds(userIds: string[]) {
        return Profile.find({ userId: { $in: userIds } });
    }

    async existsByUserId(userId: string): Promise<boolean> {
        const exists = await Profile.exists({ userId });
        return !!exists;
    }

    async updateByUserId(
        userId: string,
        update: UpdateQuery<IProfile>
    ) {
        return Profile.findOneAndUpdate(
            { userId },
            { $set: update },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );
    }

    async isUsernameExist(username: string): Promise<boolean> {
        const exists = await Profile.exists({ username });
        return !!exists;
    };

    async updateAvailability(
        userId: string,
        availability: IProfile["availability"]
    ) {
        return Profile.findOneAndUpdate(
            { userId },
            {
                $set: {
                    availability,
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );
    }

    async updateProfileCompletion(
        userId: string,
        profileCompletion: number,
        isProfileCompleted: boolean
    ) {
        return Profile.findOneAndUpdate(
            { userId },
            {
                $set: {
                    profileCompletion,
                    isProfileCompleted,
                },
            },
            {
                returnDocument: "after",
            }
        );
    }

    async deleteByUserId(userId: string) {
        return Profile.findOneAndDelete({ userId });
    }

}

export default new ProfileRepository();