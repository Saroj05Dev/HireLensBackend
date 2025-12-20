import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            organizationId: decoded.organizationId
        };

        next();

    } catch (error) {
        if(error.name === "TokenExpiredError") {
            next(new ApiError(401, "Session expired. Please log in again."));
        } else {
            next(new ApiError(401, "Unauthorized request"));
        }
    }
}

export default authMiddleware;