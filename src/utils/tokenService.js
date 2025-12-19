import jwt from "jsonwebtoken";
import { SERVER_CONFIG } from "../config/server.config.js";

export const generateToken = (payload) => {
    const accessToken = jwt.sign(
        payload,
        SERVER_CONFIG.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        payload,
        SERVER_CONFIG.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
};