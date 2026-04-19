import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import * as organizationRepository from "../repositories/organization.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as inviteRepository from "../repositories/invite.repository.js";
import * as otpRepository from "../repositories/otp.repository.js";
import { generateToken } from "../utils/tokenService.js";
import { sendOTPEmail } from "./email.service.js";
import ApiError from "../utils/ApiError.js";

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP to email for signup verification
 */
export const sendSignupOTP = async ({ email }) => {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Check if user already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Generate 6-digit OTP
  const otp = generateOTP();

  // Save OTP to database
  await otpRepository.create({
    email,
    otp,
    purpose: "SIGNUP",
  });

  // Send OTP email
  const emailResult = await sendOTPEmail({ email, otp });

  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send OTP email");
  }

  return {
    message: "OTP sent successfully",
    email,
  };
};

/**
 * Verify OTP for signup
 */
export const verifySignupOTP = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find valid OTP
  const otpRecord = await otpRepository.findValidOTP(email, "SIGNUP");

  if (!otpRecord) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  // Check if OTP matches
  if (otpRecord.otp !== otp) {
    throw new ApiError(401, "Invalid OTP");
  }

  // Mark OTP as verified
  await otpRepository.markVerified(otpRecord._id);

  return {
    message: "Email verified successfully",
    email,
    verified: true,
  };
};

export const register = async ({ name, email, password, organizationName }) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // 2. Verify that email has been verified via OTP
    const hasVerifiedOTP = await otpRepository.hasRecentVerifiedOTP(email, "SIGNUP");
    if (!hasVerifiedOTP) {
      throw new ApiError(403, "Email not verified. Please verify your email first.");
    }

    // 3. Create Organization
    const organization = await organizationRepository.create(
      {
        name: organizationName,
      },
      session
    );

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create Admin User
    const user = await userRepository.create(
      {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization._id,
      },
      session
    );

    // 6. Set organization owner
    await organizationRepository.updateOwner(
      organization._id,
      user._id,
      session // pass the session to ensure it's part of the transaction
    );

    // 7. Generate tokens
    const tokens = generateToken({
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId,
    });

    // 8. Clean up OTP records for this email
    await otpRepository.deleteByEmail(email, "SIGNUP");

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      user: {
        id: user._id,
        role: user.role,
      },
      organization: {
        id: organization._id,
      },
      tokens,
    };
  } catch (error) {
    // Rollback transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user + password
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const tokens = generateToken({
    userId: user._id,
    role: user.role,
    organizationId: user.organizationId,
  });

  // Return safe data only
  return {
    user: {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId,
    },
    tokens,
  };
};

export const refresh = async (cookies) => {
  const refreshToken = cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Issue new access token
    const newAccessToken = generateToken({
      userId: decoded.userId,
      role: decoded.role,
      organizationId: decoded.organizationId,
    }).accessToken;

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

export const fetchMe = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch organization details
  let organizationName = null;
  if (user.organizationId) {
    const organization = await organizationRepository.findById(user.organizationId);
    organizationName = organization?.name || null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

export const acceptInvite = async ({ token, name, password }) => {
  // Validate required fields
  if (!token || !name || !password) {
    throw new ApiError(400, "Token, name and password are required");
  }

  // Find invite by token
  const invite = await inviteRepository.findByToken(token);
  if (!invite) {
    throw new ApiError(404, "Invitation not found");
  }

  // Check expiration
  if (new Date() > invite.expiresAt) {
    throw new ApiError(401, "Invitation has expired");
  }

  // Check if already accepted
  if (invite.isAccepted) {
    throw new ApiError(400, "Invitation already accepted");
  }

  // Hash password (salt rounds = 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create active user
  const user = await userRepository.create({
    name,
    email: invite.email,
    password: hashedPassword,
    role: invite.role,
    organizationId: invite.organizationId,
    isActive: true,
  });

  // Mark invite as accepted
  await inviteRepository.markAccepted(invite._id);

  // Generate JWT tokens
  const tokens = generateToken({
    userId: user._id,
    role: user.role,
    organizationId: user.organizationId,
  });

  // Return user details and tokens
  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    tokens,
  };
};
