import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { SERVER_CONFIG } from "../config/server.config.js";
import ApiError from "../utils/ApiError.js";
import * as userRepository from "../repositories/user.repository.js";

export const inviteUser = async (
    adminUser,
    { email, role }
) => {

    const normalizedRole = role?.toUpperCase().trim();

    // 1. Validate role
    if (!['RECRUITER', 'INTERVIEWER'].includes(normalizedRole)) {
        throw new ApiError(400, 'Invalid role for invitation');
    }

    // 2. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }

    // 3. Create inactive user
    const user = await userRepository.create({
        email,
        role,
        organizationId: adminUser.organizationId,
        isActive: false
    });

    // 4. Generate invitation token ( short-lived JWT )
    const inviteToken = jwt.sign(
        {
            userId: user._id,
            organizationId: adminUser.organizationId,
        },
        SERVER_CONFIG.JWT_ACCESS_SECRET,
        { expiresIn: '24h' }
    );

    return {
        invitedUser: {
            id: user._id,
            email: user.email,
            role: normalizedRole
        },
        inviteToken // v1: return token directly, v2: send via email
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

export const getOrganizationMembers = async (organizationId) => {
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

export const deactivateMember = async (orgId, userId) => {
    const user = await userRepository.findById(userId);

    if (!user || user.organizationId.toString() !== orgId) {
        throw new ApiError(404, 'Member not found in this organization');
    }

    // Deactivate the user
    await userRepository.updateById(userId, { isActive: false });
}