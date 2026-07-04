import { UserModel } from "../models/user.model.ts";
import { IUser } from "../types/user.types.ts";
import { Types } from "mongoose";

export class UserRepository {
  static async findById(id: string) {
    return UserModel.findById(id);
  }

  static async findByIdWithPassword(id: string) {
    return UserModel.findById(id).select("+password");
  }

  static async findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  static async findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email }).select("+password");
  }

  static async existsByEmail(
    email: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const query: Record<string, unknown> = { email };

    if (excludeUserId) {
      query._id = {
        $ne: new Types.ObjectId(excludeUserId),
      };
    }

    return (await UserModel.exists(query)) !== null;
  }

  static async create(data: Partial<IUser>) {
    return UserModel.create(data);
  }

  static async updateById(
    _id: string,
    update: Record<string, unknown>,
  ) {
    return UserModel.findByIdAndUpdate(_id, update, {
      new: true,
    });
  }

  static async save(user: InstanceType<typeof UserModel>) {
    return user.save();
  }
}