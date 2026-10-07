import crypto from "crypto";
import { redis } from "../config/redis.js";

type OtpPurpose = "SIGNUP" | "PASSWORD_RESET";

const OTP_TTL_SECONDS = 10 * 60;
const VERIFIED_OTP_TTL_SECONDS = 15 * 60;
const OTP_SEND_LIMIT = 3;
const OTP_VERIFY_LIMIT = 5;
const OTP_RATE_LIMIT_TTL_SECONDS = 10 * 60;

const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const emailHash = (email: string): string => {
  return crypto
    .createHash("sha256")
    .update(normalizeEmail(email))
    .digest("hex");
};

const pendingOtpKey = (email: string, purpose: OtpPurpose): string => {
  return `otp:${purpose}:${emailHash(email)}`;
};

const verifiedOtpKey = (email: string, purpose: OtpPurpose): string => {
  return `otp:verified:${purpose}:${emailHash(email)}`;
};

const rateLimitKey = (
  email: string,
  purpose: OtpPurpose,
  operation: "send" | "verify"
): string => {
  return `otp:rate-limit:${operation}:${purpose}:${emailHash(email)}`;
};

const consumeRateLimit = async (
  key: string,
  limit: number
): Promise<boolean> => {
  const result = await redis.eval(
    `
      local count = redis.call("INCR", KEYS[1])

      if count == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end

      return count
    `,
    {
      keys: [key],
      arguments: [OTP_RATE_LIMIT_TTL_SECONDS.toString()],
    }
  );

  return Number(result) <= limit;
};

export interface CreateOtpParams {
  email: string;
  otp: string;
  purpose?: OtpPurpose;
}

export const create = async ({
  email,
  otp,
  purpose = "SIGNUP",
}: CreateOtpParams): Promise<void> => {
  await redis.set(pendingOtpKey(email, purpose), otp, {
    EX: OTP_TTL_SECONDS,
  });
};

export const verify = async (
  email: string,
  otp: string,
  purpose: OtpPurpose = "SIGNUP"
): Promise<boolean> => {
  const key = pendingOtpKey(email, purpose);

  const result = await redis.eval(
    `
      local storedOtp = redis.call("GET", KEYS[1])

      if storedOtp == ARGV[1] then
        redis.call("DEL", KEYS[1])
        return 1
      end

      return 0
    `,
    {
      keys: [key],
      arguments: [otp],
    }
  );

  const isValid = result === 1;

  if (isValid) {
    await redis.set(verifiedOtpKey(email, purpose), "1", {
      EX: VERIFIED_OTP_TTL_SECONDS,
    });
  }

  return isValid;
};

export const consumeSendAttempt = async (
  email: string,
  purpose: OtpPurpose = "SIGNUP"
): Promise<boolean> => {
  return consumeRateLimit(rateLimitKey(email, purpose, "send"), OTP_SEND_LIMIT);
};

export const consumeVerifyAttempt = async (
  email: string,
  purpose: OtpPurpose = "SIGNUP"
): Promise<boolean> => {
  return consumeRateLimit(
    rateLimitKey(email, purpose, "verify"),
    OTP_VERIFY_LIMIT
  );
};

/**
 * Delete all OTPs for an email (cleanup after successful verification)
 */
export const deleteByEmail = async (
  email: string,
  purpose: OtpPurpose = "SIGNUP"
): Promise<void> => {
  await redis.del([
    pendingOtpKey(email, purpose),
    verifiedOtpKey(email, purpose),
  ]);
};

/**
 * Check if email has a verified OTP within last 15 minutes
 */
export const hasRecentVerifiedOTP = async (
  email: string,
  purpose: OtpPurpose = "SIGNUP"
): Promise<boolean> => {
  const result = await redis.exists(verifiedOtpKey(email, purpose));
  return result === 1;
};