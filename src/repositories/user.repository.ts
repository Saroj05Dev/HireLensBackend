import { ClientSession, Types } from "mongoose";
import User, { IUser, IUserDocument, UserRole } from "../models/User.js";

export const findByEmail = async (email: string): Promise<IUserDocument | null> => {
  const user = await User.findOne({ email });
  return user;
};

export const findById = async (id: string | Types.ObjectId): Promise<IUserDocument | null> => {
  return User.findById(id);
};

export const findByEmailWithPassword = async (email: string): Promise<IUserDocument | null> => {
  const user = await User.findOne({ email }).select("+password");
  return user;
};

export const findByOrganizationId = async (
  organizationId: string | Types.ObjectId
): Promise<IUserDocument[]> => {
  return User.find({ organizationId })
    .select("_id name email role isActive createdAt")
    .sort({ createdAt: -1 });
};

export const create = async (
  data: Partial<IUser>,
  session?: ClientSession
): Promise<IUserDocument> => {
  const user = new User(data);
  await user.save({ session });
  return user;
};

export const updateById = async (
  userId: string | Types.ObjectId,
  updateData: Partial<IUser>
): Promise<IUserDocument | null> => {
  return User.findByIdAndUpdate(userId, updateData, { new: true });
};

export const findByOrganizationAndRole = async (
  organizationId: string | Types.ObjectId,
  role: UserRole
): Promise<IUserDocument[]> => {
  return User.find({
    organizationId,
    role,
    isActive: true,
  })
    .select("_id name email role")
    .sort({ name: 1 });
};

export const updatePassword = async (
  userId: string | Types.ObjectId,
  hashedPassword: string
): Promise<IUserDocument | null> => {
  return User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true }
  );
};