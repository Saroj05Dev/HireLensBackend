import type { Express } from "express";
import "multer";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.config.js";
import ApiError from "../utils/ApiError.js";

// ...rest remains unchanged

export const getProfile = async (userId: string) => {
  const user: any = await User.findById(userId)
    .populate("organizationId", "name")
    .select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId?._id,
    organizationName: user.organizationId?.name,
    avatarUrl: user.avatarUrl,
    title: user.title,
    createdAt: user.createdAt,
  };
};

export const updateProfile = async (userId: string, updates: Record<string, any>) => {
  const allowedUpdates = ["name", "title"];
  const filteredUpdates: Record<string, any> = {};

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  });

  const user: any = await User.findByIdAndUpdate(
    userId,
    filteredUpdates,
    { new: true, runValidators: true }
  ).populate("organizationId", "name");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId?._id,
    organizationName: user.organizationId?.name,
    avatarUrl: user.avatarUrl,
    title: user.title,
  };
};

export const uploadAvatar = async (userId: string, file?: Express.Multer.File) => {
  if (!file) {
    throw new ApiError(400, "Avatar file is required");
  }

  try {
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hirelens/avatars",
          public_id: `avatar_${userId}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
          ],
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );

      uploadStream.end(file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: result.secure_url },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return result.secure_url;
  } catch (error: any) {
    throw new ApiError(500, "Failed to upload avatar: " + error.message);
  }
};