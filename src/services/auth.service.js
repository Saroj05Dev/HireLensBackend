import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import * as organizationRepository from "../repositories/organization.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as inviteRepository from "../repositories/invite.repository.js";
import { generateToken } from "../utils/tokenService.js";
import ApiError from "../utils/ApiError.js";

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

    // 2. Create Organization
    const organization = await organizationRepository.create(
      {
        name: organizationName,
      },
      session
    );

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create Admin User
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

    // 5. Set organization owner
    await organizationRepository.updateOwner(
      organization._id,
      user._id,
      session // pass the session to ensure it's part of the transaction
    );

    // 6. Generate tokens
    const tokens = generateToken({
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId,
    });
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

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
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
