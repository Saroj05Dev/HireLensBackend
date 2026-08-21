import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service.js";

const getParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || "";
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const { limit = "50", skip = "0", unreadOnly = "false" } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit as string) || 50,
      skip: parseInt(skip as string) || 0,
      unreadOnly: unreadOnly === "true",
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: "Notifications fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: { count },
      message: "Unread count fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const id = getParam(req.params.id);

    const notification = await notificationService.markAsRead(id, userId);

    return res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const id = getParam(req.params.id);

    const result = await notificationService.deleteNotification(id, userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const userId = req.user.id;
    const result = await notificationService.deleteAllNotifications(userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};