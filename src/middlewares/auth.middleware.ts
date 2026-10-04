import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import {  SERVER_CONFIG } from "../config/server.config.js";
import ApiError from "../utils/ApiError.js";

interface DecodedToken {
    userId: string;
    role: string;
    organizationId: string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.accessToken;

        console.log('Auth middleware - cookies:', req.cookies);
        console.log('Auth middleware - accessToken:', token ? 'present' : 'missing');
        console.log('Auth middleware - user-agent:', req.headers['user-agent']);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify token
        const secret: Secret = SERVER_CONFIG.JWT_ACCESS_SECRET || "default_access_secret";
        const decoded = jwt.verify(
            token,
            secret
        ) as DecodedToken;

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            organizationId: decoded.organizationId
        };

        console.log('Auth middleware - user authenticated:', req.user.id);
        next();

    } catch (error: any) {
        console.log('Auth middleware - error:', error.message);
        if(error.name === "TokenExpiredError") {
            next(new ApiError(401, "Session expired. Please log in again."));
        } else {
            next(new ApiError(401, "Unauthorized request"));
        }
    }
}

export default authMiddleware;