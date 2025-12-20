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

export const login = async (req, res, next) => {
    try {
        const { user, tokens } = await authService.login(req.body);

        // Set httpOnly cookies
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            success: true,
            data: user,
            message: "Login successful",
        })
    } catch (error) {
        next(error);
    }
}

export const logout = async (req, res, next) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
        success: true,
        message: "Logout successful",
    });
}

export const refresh = async (req, res, next) => {
    try {
        const token = await authService.refresh(req.cookies);

        // Set new access token cookie
        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
        });
    } catch (error) {
        next(error);
    }
}