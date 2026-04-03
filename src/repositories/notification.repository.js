import Notification from "../models/Notification.js";

export const create = async (data) => {
    const notification = new Notification(data);
    await notification.save();
    return notification;
};

export const findByUserId = async (userId, { limit = 50, skip = 0, unreadOnly = false }) => {
    const query = { userId };
    
    if (unreadOnly) {
        query.isRead = false;
    }
    
    return Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

export const countUnread = async (userId) => {
    return Notification.countDocuments({ userId, isRead: false });
};

export const markAsRead = async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

export const deleteById = async (notificationId, userId) => {
    return Notification.findOneAndDelete({ _id: notificationId, userId });
};

export const deleteAll = async (userId) => {
    return Notification.deleteMany({ userId });
};
