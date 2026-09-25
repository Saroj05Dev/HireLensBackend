import { NotificationType } from "@prisma/client";
import * as notificationRepository from "../repositories/notification.repository.js";
import { emitNotification } from "../config/socket.js";
import ApiError from "../utils/ApiError.js";

interface CreateNotificationParams {
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export const createNotification = async ({
  userId,
  organizationId,
  type,
  title,
  message,
  metadata = {},
}: CreateNotificationParams) => {
  const notification = await notificationRepository.create({
    userId,
    organizationId,
    type,
    title,
    message,
    metadata,
  });

  emitNotification(userId, notification);
  return notification;
};

export const getUserNotifications = async (
  userId: string,
  { limit = 50, skip = 0, unreadOnly = false }: { limit?: number; skip?: number; unreadOnly?: boolean } = {}
) => {
  const notifications = await notificationRepository.findByUserId(userId, { limit, skip, unreadOnly });
  const unreadCount = await notificationRepository.countUnread(userId);

  return {
    notifications,
    unreadCount,
    total: notifications.length,
  };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return notificationRepository.countUnread(userId);
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await notificationRepository.markAsRead(notificationId, userId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

export const markAllAsRead = async (userId: string) => {
  await notificationRepository.markAllAsRead(userId);
  return { message: "All notifications marked as read" };
};

export const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await notificationRepository.deleteById(notificationId, userId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return { message: "Notification deleted successfully" };
};

export const deleteAllNotifications = async (userId: string) => {
  await notificationRepository.deleteAll(userId);
  return { message: "All notifications deleted successfully" };
};

export const notifyInterviewAssignment = async ({
  interviewerId,
  candidateName,
  jobTitle,
  interviewDate,
  organizationId,
  metadata,
}: {
  interviewerId: string;
  candidateName: string;
  jobTitle: string;
  interviewDate: Date | string;
  organizationId: string;
  metadata?: Record<string, any>;
}) => {
  return createNotification({
    userId: interviewerId,
    organizationId,
    type: NotificationType.INTERVIEW_ASSIGNED,
    title: "New Interview Assigned",
    message: `You have been assigned to interview ${candidateName} for ${jobTitle} on ${new Date(interviewDate).toLocaleDateString()}`,
    metadata,
  });
};

export const notifyFeedbackSubmitted = async ({
  recruiterId,
  candidateName,
  interviewerName,
  organizationId,
  metadata,
}: {
  recruiterId: string;
  candidateName: string;
  interviewerName: string;
  organizationId: string;
  metadata?: Record<string, any>;
}) => {
  return createNotification({
    userId: recruiterId,
    organizationId,
    type: NotificationType.INTERVIEW_FEEDBACK_SUBMITTED,
    title: "Interview Feedback Submitted",
    message: `${interviewerName} has submitted feedback for ${candidateName}`,
    metadata,
  });
};

export const notifyCandidateStageChange = async ({
  userId,
  candidateName,
  oldStage,
  newStage,
  organizationId,
  metadata,
}: {
  userId: string;
  candidateName: string;
  oldStage: string;
  newStage: string;
  organizationId: string;
  metadata?: Record<string, any>;
}) => {
  return createNotification({
    userId,
    organizationId,
    type: NotificationType.CANDIDATE_STAGE_CHANGED,
    title: "Candidate Stage Updated",
    message: `${candidateName} moved from ${oldStage} to ${newStage}`,
    metadata,
  });
};

export const notifyTeamInvitation = async ({
  userId,
  inviterName,
  organizationName,
  organizationId,
  metadata,
}: {
  userId: string;
  inviterName: string;
  organizationName: string;
  organizationId: string;
  metadata?: Record<string, any>;
}) => {
  return createNotification({
    userId,
    organizationId,
    type: NotificationType.TEAM_INVITATION,
    title: "Team Invitation",
    message: `${inviterName} invited you to join ${organizationName}`,
    metadata,
  });
};

export const notifyJobStatusChange = async ({
  userId,
  jobTitle,
  status,
  organizationId,
  metadata,
}: {
  userId: string;
  jobTitle: string;
  status: string;
  organizationId: string;
  metadata?: Record<string, any>;
}) => {
  return createNotification({
    userId,
    organizationId,
    type: NotificationType.JOB_STATUS_CHANGED,
    title: "Job Status Changed",
    message: `${jobTitle} has been ${status.toLowerCase()}`,
    metadata,
  });
};

export const notifyCandidateAdded = async ({
  userId,
  candidateName,
  jobTitle,
  organizationId,
  metadata,
}: {
  userId: string;
  candidateName: string;
  jobTitle: string;
  organizationId: string;
  metadata?: Record<string, any>;
}) => {
  return createNotification({
    userId,
    organizationId,
    type: NotificationType.CANDIDATE_ADDED,
    title: "New Candidate Added",
    message: `${candidateName} has been added to ${jobTitle}`,
    metadata,
  });
};