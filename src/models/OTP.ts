import mongoose, { Document, Model, Schema } from "mongoose";

export const OTP_PURPOSES = ["SIGNUP", "PASSWORD_RESET"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export interface IOTP {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  isVerified: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOTPDocument extends IOTP, Document {}

const otpSchema = new Schema<IOTPDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: OTP_PURPOSES,
      default: "SIGNUP",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, purpose: 1 });

const OTP: Model<IOTPDocument> = mongoose.model<IOTPDocument>("OTP", otpSchema);

export default OTP;