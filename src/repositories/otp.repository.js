import OTP from "../models/OTP.js";

/**
 * Create a new OTP record
 */
export const create = async ({ email, otp, purpose = "SIGNUP" }) => {
  return await OTP.create({ email, otp, purpose });
};

/**
 * Find the most recent valid OTP for an email and purpose
 */
export const findValidOTP = async (email, purpose = "SIGNUP") => {
  return await OTP.findOne({
    email,
    purpose,
    isVerified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

/**
 * Mark OTP as verified
 */
export const markVerified = async (otpId) => {
  return await OTP.findByIdAndUpdate(
    otpId,
    { isVerified: true },
    { new: true }
  );
};

/**
 * Delete all OTPs for an email (cleanup after successful verification)
 */
export const deleteByEmail = async (email, purpose = "SIGNUP") => {
  return await OTP.deleteMany({ email, purpose });
};

/**
 * Check if email has a verified OTP within last 15 minutes
 */
export const hasRecentVerifiedOTP = async (email, purpose = "SIGNUP") => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const verifiedOTP = await OTP.findOne({
    email,
    purpose,
    isVerified: true,
    createdAt: { $gte: fifteenMinutesAgo },
  });
  return !!verifiedOTP;
};
