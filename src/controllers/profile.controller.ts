import { Request, Response } from "express";
import * as profileService from "../services/profile.service.js";

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const profile = await profileService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const updates = req.body;

    const updatedProfile = await profileService.updateProfile(userId, updates);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const avatarUrl = await profileService.uploadAvatar(userId, req.file);

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { avatarUrl },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};