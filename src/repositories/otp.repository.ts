import { OTP, OtpPurpose, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface CreateOtpParams {
  email: string;
  otp: string;
  purpose?: OtpPurpose;
}

/**
 * Create a new OTP record
 */
export const create = async (
  { email, otp, purpose = OtpPurpose.SIGNUP }: CreateOtpParams,
  tx?: Prisma.TransactionClient
): Promise<OTP> => {
  const db = tx || prisma;
  return db.oTP.create({
    data: {
      email: email.toLowerCase().trim(),
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes default
    },
  });
};

/**
 * Find the most recent valid OTP for an email and purpose
 */
export const findValidOTP = async (
  email: string,
  purpose: OtpPurpose = OtpPurpose.SIGNUP
): Promise<OTP | null> => {
  return prisma.oTP.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      purpose,
      isVerified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Mark OTP as verified
 */
export const markVerified = async (
  otpId: string,
  tx?: Prisma.TransactionClient
): Promise<OTP | null> => {
  const db = tx || prisma;
  return db.oTP.update({
    where: { id: otpId },
    data: { isVerified: true },
  });
};

/**
 * Delete all OTPs for an email (cleanup after successful verification)
 */
export const deleteByEmail = async (
  email: string,
  purpose: OtpPurpose = OtpPurpose.SIGNUP,
  tx?: Prisma.TransactionClient
): Promise<Prisma.BatchPayload> => {
  const db = tx || prisma;
  return db.oTP.deleteMany({
    where: {
      email: email.toLowerCase().trim(),
      purpose,
    },
  });
};

/**
 * Check if email has a verified OTP within last 15 minutes
 */
export const hasRecentVerifiedOTP = async (
  email: string,
  purpose: OtpPurpose = OtpPurpose.SIGNUP
): Promise<boolean> => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const verifiedOTP = await prisma.oTP.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      purpose,
      isVerified: true,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  return Boolean(verifiedOTP);
};