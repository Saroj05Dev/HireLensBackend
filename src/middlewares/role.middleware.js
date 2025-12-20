import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
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