import jwt from "jsonwebtoken";
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