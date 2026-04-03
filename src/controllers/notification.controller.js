import * as notificationService from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 50, skip = 0, unreadOnly = false } = req.query;

        const result = await notificationService.getUserNotifications(userId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            unreadOnly: unreadOnly === 'true'
        });

        return res.status(200).json({
            success: true,
            data: result,
            message: "Notifications fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const count = await notificationService.getUnreadCount(userId);

        return res.status(200).json({
            success: true,
            data: { count },
            message: "Unread count fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id, userId);

        return res.status(200).json({
            success: true,
            data: notification,
            message: "Notification marked as read"
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await notificationService.markAllAsRead(userId);

        return res.status(200).json({
            success: true,
            data: result,
            message: "All notifications marked as read"
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await notificationService.deleteNotification(id, userId);

        return res.status(200).json({
            success: true,
            data: result,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAllNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await notificationService.deleteAllNotifications(userId);

        return res.status(200).json({
            success: true,
            data: result,
            message: "All notifications deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
