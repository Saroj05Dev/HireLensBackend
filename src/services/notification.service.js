import * as notificationRepository from "../repositories/notification.repository.js";
import { emitNotification } from "../config/socket.js";
import ApiError from "../utils/ApiError.js";

// Create a notification
export const createNotification = async ({ userId, organizationId, type, title, message, metadata = {} }) => {
    const notification = await notificationRepository.create({
        userId,
        organizationId,
        type,
        title,
        message,
        metadata
    });

    // Emit real-time notification via socket
    emitNotification(userId, notification);

    return notification;
};

// Get user notifications
export const getUserNotifications = async (userId, { limit = 50, skip = 0, unreadOnly = false }) => {
    const notifications = await notificationRepository.findByUserId(userId, { limit, skip, unreadOnly });
    const unreadCount = await notificationRepository.countUnread(userId);

    return {
        notifications,
        unreadCount,
        total: notifications.length
    };
};

// Get unread count
export const getUnreadCount = async (userId) => {
    return notificationRepository.countUnread(userId);
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return notification;
};

// Mark all as read
export const markAllAsRead = async (userId) => {
    await notificationRepository.markAllAsRead(userId);
    return { message: "All notifications marked as read" };
};

// Delete notification
export const deleteNotification = async (notificationId, userId) => {
    const notification = await notificationRepository.deleteById(notificationId, userId);
    
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return { message: "Notification deleted successfully" };
};

// Delete all notifications
export const deleteAllNotifications = async (userId) => {
    await notificationRepository.deleteAll(userId);
    return { message: "All notifications deleted successfully" };
};

// Helper functions to create specific notification types

export const notifyInterviewAssignment = async ({ interviewerId, candidateName, jobTitle, interviewDate, organizationId, metadata }) => {
    return createNotification({
        userId: interviewerId,
        organizationId,
        type: "INTERVIEW_ASSIGNED",
        title: "New Interview Assigned",
        message: `You have been assigned to interview ${candidateName} for ${jobTitle} on ${new Date(interviewDate).toLocaleDateString()}`,
        metadata
    });
};

export const notifyFeedbackSubmitted = async ({ recruiterId, candidateName, interviewerName, organizationId, metadata }) => {
    return createNotification({
        userId: recruiterId,
        organizationId,
        type: "INTERVIEW_FEEDBACK_SUBMITTED",
        title: "Interview Feedback Submitted",
        message: `${interviewerName} has submitted feedback for ${candidateName}`,
        metadata
    });
};

export const notifyCandidateStageChange = async ({ userId, candidateName, oldStage, newStage, organizationId, metadata }) => {
    return createNotification({
        userId,
        organizationId,
        type: "CANDIDATE_STAGE_CHANGED",
        title: "Candidate Stage Updated",
        message: `${candidateName} moved from ${oldStage} to ${newStage}`,
        metadata
    });
};

export const notifyTeamInvitation = async ({ userId, inviterName, organizationName, organizationId, metadata }) => {
    return createNotification({
        userId,
        organizationId,
        type: "TEAM_INVITATION",
        title: "Team Invitation",
        message: `${inviterName} invited you to join ${organizationName}`,
        metadata
    });
};

export const notifyJobStatusChange = async ({ userId, jobTitle, status, organizationId, metadata }) => {
    return createNotification({
        userId,
        organizationId,
        type: "JOB_STATUS_CHANGED",
        title: "Job Status Changed",
        message: `${jobTitle} has been ${status.toLowerCase()}`,
        metadata
    });
};

export const notifyCandidateAdded = async ({ userId, candidateName, jobTitle, organizationId, metadata }) => {
    return createNotification({
        userId,
        organizationId,
        type: "CANDIDATE_ADDED",
        title: "New Candidate Added",
        message: `${candidateName} has been added to ${jobTitle}`,
        metadata
    });
};
