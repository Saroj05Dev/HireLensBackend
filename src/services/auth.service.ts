import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";

import { prisma } from "../config/prisma.js";
import * as organizationRepository from "../repositories/organization.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as inviteRepository from "../repositories/invite.repository.js";
import * as otpRepository from "../repositories/otp.repository.js";
import { generateToken, AuthTokens } from "../utils/tokenService.js";
import { sendOTPEmail } from "./email.service.js";
import ApiError from "../utils/ApiError.js";

const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendSignupOTP = async ({ email }: { email: string }) => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const otp = generateOTP();

  await otpRepository.create({
    email,
    otp,
    purpose: "SIGNUP",
  });

  const emailResult = await sendOTPEmail({ email, otp });

  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send OTP email");
  }

  return {
    message: "OTP sent successfully",
    email,
  };
};

export const verifySignupOTP = async ({ email, otp }: { email: string; otp: string }) => {
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const otpRecord = await otpRepository.findValidOTP(email, "SIGNUP");

  if (!otpRecord) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  if (otpRecord.otp !== otp) {
    throw new ApiError(401, "Invalid OTP");
  }

  await otpRepository.markVerified(otpRecord.id);

  return {
    message: "Email verified successfully",
    email,
    verified: true,
  };
};

export const sendPasswordResetOTP = async ({ email }: { email: string }) => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    return {
      message: "If an account exists with this email, you will receive a password reset code",
      email,
    };
  }

  const otp = generateOTP();

  await otpRepository.create({
    email,
    otp,
    purpose: "PASSWORD_RESET",
  });

  const emailResult = await sendOTPEmail({ email, otp, purpose: "PASSWORD_RESET" });

  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send password reset email");
  }

  return {
    message: "Password reset code sent successfully",
    email,
  };
};

export const verifyPasswordResetOTP = async ({ email, otp }: { email: string; otp: string }) => {
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const otpRecord = await otpRepository.findValidOTP(email, "PASSWORD_RESET");

  if (!otpRecord) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  if (otpRecord.otp !== otp) {
    throw new ApiError(401, "Invalid OTP");
  }

  await otpRepository.markVerified(otpRecord.id);

  return {
    message: "OTP verified successfully",
    email,
    verified: true,
  };
};

export const resetPassword = async ({ email, newPassword }: { email: string; newPassword: string }) => {
  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }

  const hasVerifiedOTP = await otpRepository.hasRecentVerifiedOTP(email, "PASSWORD_RESET");
  if (!hasVerifiedOTP) {
    throw new ApiError(403, "Please verify your email first");
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(user.id, hashedPassword);
  await otpRepository.deleteByEmail(email, "PASSWORD_RESET");

  return {
    message: "Password reset successfully",
  };
};

export const register = async ({
  name,
  email,
  password,
  organizationName,
}: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hasVerifiedOTP = await otpRepository.hasRecentVerifiedOTP(email, "SIGNUP");
  if (!hasVerifiedOTP) {
    throw new ApiError(403, "Email not verified. Please verify your email first.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const organization = await organizationRepository.create(
      { name: organizationName },
      tx
    );

    const user = await userRepository.create(
      {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      },
      tx
    );

    await organizationRepository.updateOwner(organization.id, user.id, tx);

    const tokens: AuthTokens = generateToken({
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId,
    });

    await otpRepository.deleteByEmail(email, "SIGNUP", tx);

    return {
      user: {
        id: user.id,
        role: user.role,
      },
      organization: {
        id: organization.id,
      },
      tokens,
    };
  });
};

export const login = async ({ email, password }: { email?: string; password?: string }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await userRepository.findByEmailWithPassword(email);
  if (!user || !user.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens: AuthTokens = generateToken({
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
  });

  return {
    user: {
      id: user.id,
      role: user.role,
      organizationId: user.organizationId,
    },
    tokens,
  };
};

export const refresh = async (cookies: Record<string, any>) => {
  const refreshToken = cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  try {
    const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET || "";
    const decoded = jwt.verify(refreshToken, refreshSecret) as any;

    const newAccessToken = generateToken({
      userId: decoded.userId,
      role: decoded.role,
      organizationId: decoded.organizationId,
    }).accessToken;

    return {
      accessToken: newAccessToken,
    };
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

export const fetchMe = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let organizationName: string | null = null;
  if (user.organizationId) {
    const organization = await organizationRepository.findById(user.organizationId);
    organizationName = organization?.name || null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

export const acceptInvite = async ({
  token,
  name,
  password,
}: {
  token?: string;
  name?: string;
  password?: string;
}) => {
  if (!token || !name || !password) {
    throw new ApiError(400, "Token, name and password are required");
  }

  const invite = await inviteRepository.findByToken(token);
  if (!invite) {
    throw new ApiError(404, "Invitation not found");
  }

  if (new Date() > invite.expiresAt) {
    throw new ApiError(401, "Invitation has expired");
  }

  if (invite.isAccepted) {
    throw new ApiError(400, "Invitation already accepted");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    name,
    email: invite.email,
    password: hashedPassword,
    role: invite.role,
    organizationId: invite.organizationId,
    isActive: true,
  });

  await inviteRepository.markAccepted(invite.id);

  const tokens = generateToken({
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    tokens,
  };
};