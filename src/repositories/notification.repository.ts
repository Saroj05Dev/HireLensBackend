import { Types } from "mongoose";
import Notification, {
  INotification,
  INotificationDocument,
} from "../models/Notification.js";

interface FindByUserIdOptions {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
}

export const create = async (
  data: Partial<INotification>
): Promise<INotificationDocument> => {
  const notification = new Notification(data);
  await notification.save();
  return notification;
};

export const findByUserId = async (
  userId: string | Types.ObjectId,
  { limit = 50, skip = 0, unreadOnly = false }: FindByUserIdOptions = {}
) => {
  const query: Record<string, any> = { userId };

  if (unreadOnly) {
    query.isRead = false;
  }

  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

export const countUnread = async (
  userId: string | Types.ObjectId
): Promise<number> => {
  return Notification.countDocuments({ userId, isRead: false });
};

export const markAsRead = async (
  notificationId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<INotificationDocument | null> => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

export const markAllAsRead = async (userId: string | Types.ObjectId) => {
  return Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

export const deleteById = async (
  notificationId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<INotificationDocument | null> => {
  return Notification.findOneAndDelete({ _id: notificationId, userId });
};

export const deleteAll = async (userId: string | Types.ObjectId) => {
  return Notification.deleteMany({ userId });
};