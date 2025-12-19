import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import * as organizationRepository from "../repositories/organization.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { generateToken } from "../utils/tokenService.js";
import ApiError from "../utils/ApiError.js";

export const register = async ({
    name,
    email,
    password,
    organizationName
}) => {
    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction();

    try {
        // 1. Check if user already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw ApiError(409, "User with this email already exists");
        }

        // 2. Create Organization
        const organization = await organizationRepository.create({
            name: organizationName
        }, session);

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create Admin User
        const user = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: "ADMIN",
            organizationId: organization._id
        }, session);

        // 5. Set organization owner
        await organizationRepository.updateOwner(
            organization._id,
            user._id,
            session
        );

        // 6. Generate tokens
        const tokens = generateToken({
            userId: user._id,
            role: user.role,
            organizationId: user.organizationId
        });

        await session.commitTransaction();
        session.endSession();

        return {
            user: {
                id: user._id,
                role: user.role
            },
            organization: {
                id: organization._id,
            },
            tokens
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}