import type { Express } from "express";
import "multer";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.config.js";
import ApiError from "../utils/ApiError.js";

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organization?.name || null,
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

  const user = await prisma.user.update({
    where: { id: userId },
    data: filteredUpdates,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organization?.name || null,
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

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.secure_url },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return result.secure_url;
  } catch (error: any) {
    throw new ApiError(500, "Failed to upload avatar: " + error.message);
  }
};