import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const USER_ROLES = ["ADMIN", "RECRUITER", "INTERVIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  name?: string;
  email: string;
  password?: string;
  role: UserRole;
  organizationId: Types.ObjectId;
  avatarUrl?: string | null;
  title?: string | null;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      trim: true,
      required: function (this: IUserDocument) {
        return this.isActive === true;
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
      required: function (this: IUserDocument) {
        return this.isActive === true;
      },
    },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    title: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema);
export default User;