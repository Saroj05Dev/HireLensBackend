import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { SERVER_CONFIG } from "../config/server.config.js";
import ApiError from "../utils/ApiError.js";
import * as userRepository from "../repositories/user.repository.js";
import * as inviteRepository from "../repositories/invite.repository.js";
import * as organizationRepository from "../repositories/organization.repository.js";
import { sendInviteEmail } from "./email.service.js";
import { InviteRole } from "../models/Invite.js";
import mongoose from "mongoose";

interface AdminUserContext {
  id?: string;
  _id?: string;
  organizationId: string;
  [key: string]: any;
}

export const inviteUser = async (
  adminUser: AdminUserContext,
  { email, role }: { email: string; role: string }
) => {
  const normalizedRole = role?.toUpperCase().trim() as InviteRole;

  if (!["RECRUITER", "INTERVIEWER"].includes(normalizedRole)) {
    throw new ApiError(400, "Invalid role for invitation");
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const pendingInvite = await inviteRepository.findPendingByEmailAndOrg(
    email,
    adminUser.organizationId
  );
  if (pendingInvite) {
    throw new ApiError(409, "Pending invitation already exists for this email");
  }

  const token = randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await inviteRepository.create({
    email,
    role: normalizedRole,
    organizationId: new mongoose.Types.ObjectId(adminUser.organizationId),
    token,
    expiresAt,
    isAccepted: false,
  });

  const inviteUrl = `${SERVER_CONFIG.FRONTEND_URL}/invite/${token}`;

  const organization = await organizationRepository.findById(adminUser.organizationId);
  const organizationName = organization?.name || "HireLens";

  console.log(`[Invite] Attempting to send email to ${email} for org ${organizationName}`);
  sendInviteEmail({
    email,
    role: normalizedRole,
    organizationName,
    inviteUrl,
    expiresAt,
  })
    .then((result) => {
      console.log(`[Invite] Email send result:`, result);
    })
    .catch((err) => {
      console.error("[Invite] Email send error:", err);
    });

  return {
    invite: {
      id: invite._id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
    },
    inviteUrl,
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
    throw new ApiError(400, "Token, name and password are required to accept invitation");
  }

  let decoded: any;
  try {
    const secret: jwt.Secret = SERVER_CONFIG.JWT_ACCESS_SECRET || "default_access_secret";
    decoded = jwt.verify(token, secret);
  } catch {
    throw new ApiError(401, "Invalid or expired invitation token");
  }

  const { userId, organizationId } = decoded;

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, "Invited user not found");
  }

  if (user.isActive) {
    throw new ApiError(400, "Invitation already accepted");
  }

  if (user.organizationId.toString() !== organizationId) {
    throw new ApiError(400, "Token organization mismatch");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.name = name;
  user.password = hashedPassword;
  user.isActive = true;

  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};

export const getPendingInvites = async (organizationId: string) => {
  const invites = await inviteRepository.findPendingByOrganization(organizationId);

  return invites.map((invite) => ({
    id: invite._id,
    email: invite.email,
    role: invite.role,
    token: invite.token,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  }));
};

export const getMembers = async (organizationId: string) => {
  const users = await userRepository.findByOrganizationId(organizationId);

  return users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }));
};

export const deactivateMember = async (adminUser: AdminUserContext, userId: string) => {
  if (!adminUser || !adminUser.organizationId) {
    throw new ApiError(400, "Invalid admin user context");
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "Member not found in this organization");
  }

  const userOrgId = user.organizationId?.toString() || user.organizationId;
  const adminOrgId = adminUser.organizationId?.toString() || adminUser.organizationId;

  if (userOrgId !== adminOrgId) {
    throw new ApiError(404, "Member not found in this organization");
  }

  const userId_str = user._id?.toString() || user._id;
  const adminId_str = adminUser._id?.toString() || adminUser.id?.toString() || adminUser._id;

  if (userId_str === adminId_str) {
    throw new ApiError(400, "Cannot deactivate your own account");
  }

  await userRepository.updateById(userId, { isActive: false });

  return {
    success: true,
    message: "Member deactivated successfully",
  };
};

export const validateInviteToken = async (token: string) => {
  const invite = await inviteRepository.findByToken(token);

  if (!invite) {
    throw new ApiError(404, "Invitation not found");
  }

  const now = new Date();
  if (now > invite.expiresAt) {
    throw new ApiError(401, "Invitation has expired");
  }

  await invite.populate("organizationId");

  const org = invite.organizationId as any;

  return {
    organizationName: org?.name || "HireLens",
    role: invite.role,
    email: invite.email,
  };
};