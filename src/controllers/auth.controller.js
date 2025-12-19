import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            data: result,
            message: "Organization and admin user created successfully",
        });
    } catch (error) {
        next(error);
    }
};