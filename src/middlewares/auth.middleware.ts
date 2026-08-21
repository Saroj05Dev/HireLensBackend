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

        next();

    } catch (error: any) {
        if(error.name === "TokenExpiredError") {
            next(new ApiError(401, "Session expired. Please log in again."));
        } else {
            next(new ApiError(401, "Unauthorized request"));
        }
    }
}

export default authMiddleware;