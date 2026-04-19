import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { SERVER_CONFIG } from "../config/server.config.js";
import ApiError from "../utils/ApiError.js";
import * as userRepository from "../repositories/user.repository.js";
import * as inviteRepository from "../repositories/invite.repository.js";
import * as organizationRepository from "../repositories/organization.repository.js";
import { sendInviteEmail } from "./email.service.js";

export const inviteUser = async (
    adminUser,
    { email, role }
) => {
    const normalizedRole = role?.toUpperCase().trim();

    // 1. Validate role - only RECRUITER or INTERVIEWER allowed
    if (!['RECRUITER', 'INTERVIEWER'].includes(normalizedRole)) {
        throw new ApiError(400, 'Invalid role for invitation');
    }

    // 2. Check if active user already exists with this email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }

    // 3. Check if pending invite already exists for this email and organization
    const pendingInvite = await inviteRepository.findPendingByEmailAndOrg(
        email,
        adminUser.organizationId
    );
    if (pendingInvite) {
        throw new ApiError(409, 'Pending invitation already exists for this email');
    }

    // 4. Generate UUID v4 token
    const token = randomUUID();

    // 5. Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 6. Create invite record
    const invite = await inviteRepository.create({
        email,
        role: normalizedRole,
        organizationId: adminUser.organizationId,
        token,
        expiresAt,
        isAccepted: false
    });

    // 7. Return invite details and invitation URL
    const inviteUrl = `${SERVER_CONFIG.FRONTEND_URL}/invite/${token}`;

    // 8. Fetch organization name for the email
    const organization = await organizationRepository.findById(adminUser.organizationId);
    const organizationName = organization?.name || "HireLens";

    // 9. Send invite email (fire-and-forget — don't block the response)
    console.log(`[Invite] Attempting to send email to ${email} for org ${organizationName}`);
    sendInviteEmail({
        email,
        role: normalizedRole,
        organizationName,
        inviteUrl,
        expiresAt,
    }).then(result => {
        console.log(`[Invite] Email send result:`, result);
    }).catch((err) => {
        console.error("[Invite] Email send error:", err);
    });

    return {
        invite: {
            id: invite._id,
            email: invite.email,
            role: invite.role,
            token: invite.token,
            expiresAt: invite.expiresAt,
            createdAt: invite.createdAt
        },
        inviteUrl,
    };
}

export const acceptInvite = async ({
    token,
    name,
    password
}) => {
    if (!token || !name || !password) {
        throw new ApiError(400, 'Token, name and password are required to accept invitation');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, SERVER_CONFIG.JWT_ACCESS_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired invitation token');
    }

    const { userId, organizationId } = decoded;

    // Fetch invited user
    const user = await userRepository.findById(userId)
    if (!user) {
        throw new ApiError(404, 'Invited user not found');
    }

    if (user.isActive) {
        throw new ApiError(400, 'Invitation already accepted');
    }

    if (user.organizationId.toString() !== organizationId) {
        throw new ApiError(400, 'Token organization mismatch');
    }

    // Activate user account
    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = name;
    user.password = hashedPassword;
    user.isActive = true;

    await user.save();

    return {
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        }
    };
};

export const getPendingInvites = async (organizationId) => {
  const invites = await inviteRepository.findPendingByOrganization(organizationId);

  return invites.map(invite => ({
    id: invite._id,
    email: invite.email,
    role: invite.role,
    token: invite.token,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt
  }));
};

export const getMembers = async (organizationId) => {
  const users = await userRepository.findByOrganizationId(organizationId);

  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  }));
};

export const deactivateMember = async (adminUser, userId) => {
    // Validate adminUser has organizationId
    if (!adminUser || !adminUser.organizationId) {
        throw new ApiError(400, 'Invalid admin user context');
    }

    // Find user by userId
    const user = await userRepository.findById(userId);

    // Throw 404 if user not found
    if (!user) {
        throw new ApiError(404, 'Member not found in this organization');
    }

    // Verify user belongs to admin's organization (throw 404 if not)
    const userOrgId = user.organizationId?.toString() || user.organizationId;
    const adminOrgId = adminUser.organizationId?.toString() || adminUser.organizationId;
    
    if (userOrgId !== adminOrgId) {
        throw new ApiError(404, 'Member not found in this organization');
    }

    // Prevent self-deactivation (throw 400 if admin tries to deactivate self)
    const userId_str = user._id?.toString() || user._id;
    const adminId_str = adminUser._id?.toString() || adminUser.id?.toString() || adminUser._id;
    
    if (userId_str === adminId_str) {
        throw new ApiError(400, 'Cannot deactivate your own account');
    }

    // Set user.isActive = false
    await userRepository.updateById(userId, { isActive: false });

    // Return success confirmation
    return {
        success: true,
        message: 'Member deactivated successfully'
    };
}

export const validateInviteToken = async (token) => {
    // 1. Find invite by token
    const invite = await inviteRepository.findByToken(token);

    // 2. Check if invite exists (404 if not)
    if (!invite) {
        throw new ApiError(404, 'Invitation not found');
    }

    // 3. Check if current time > expiresAt (401 if expired)
    const now = new Date();
    if (now > invite.expiresAt) {
        throw new ApiError(401, 'Invitation has expired');
    }

    // 4. Populate the organizationId field to get the organization name
    await invite.populate('organizationId');

    // 5. Return organization name, role, and email
    return {
        organizationName: invite.organizationId.name,
        role: invite.role,
        email: invite.email
    };
}