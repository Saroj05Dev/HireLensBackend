import { Notification, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface FindByUserIdOptions {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
}

export const create = async (
  data: Prisma.NotificationUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<Notification> => {
  const db = tx || prisma;
  return db.notification.create({
    data,
  });
};

export const findByUserId = async (
  userId: string,
  { limit = 50, skip = 0, unreadOnly = false }: FindByUserIdOptions = {}
): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip,
  });
};

export const countUnread = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<Notification | null> => {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllAsRead = async (userId: string): Promise<Prisma.BatchPayload> => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const deleteById = async (
  notificationId: string,
  userId: string
): Promise<Notification | null> => {
  return prisma.notification.delete({
    where: {
      id: notificationId,
      userId,
    },
  });
};

export const deleteAll = async (userId: string): Promise<Prisma.BatchPayload> => {
  return prisma.notification.deleteMany({
    where: { userId },
  });
};