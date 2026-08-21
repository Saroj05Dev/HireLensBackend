import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const INVITE_ROLES = ["RECRUITER", "INTERVIEWER"] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

export interface IInvite {
  email: string;
  role: InviteRole;
  organizationId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  isAccepted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInviteDocument extends IInvite, Document {}

const inviteSchema = new Schema<IInviteDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: INVITE_ROLES,
      required: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isAccepted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

inviteSchema.index({ email: 1, organizationId: 1, isAccepted: 1 });
inviteSchema.index({ organizationId: 1, isAccepted: 1 });
inviteSchema.index({ expiresAt: 1, isAccepted: 1 });

const Invite: Model<IInviteDocument> = mongoose.model<IInviteDocument>("Invite", inviteSchema);
export default Invite;