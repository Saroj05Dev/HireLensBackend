import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles: (UserRole | string)[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role) {
            return next(new ApiError(401, "Authentication required"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    `Access denied for role: ${req.user.role}`
                )
            );
        }
        next();
    };
};

export default roleMiddleware;