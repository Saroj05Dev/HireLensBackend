import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const NOTIFICATION_TYPES = [
  "INTERVIEW_ASSIGNED",
  "INTERVIEW_FEEDBACK_SUBMITTED",
  "CANDIDATE_STAGE_CHANGED",
  "TEAM_INVITATION",
  "JOB_STATUS_CHANGED",
  "CANDIDATE_ADDED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationDocument extends INotification, Document {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotificationDocument> = mongoose.model<INotificationDocument>(
  "Notification",
  notificationSchema
);

export default Notification;