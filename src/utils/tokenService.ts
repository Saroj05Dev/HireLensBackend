import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import crypto from "crypto";
import { SERVER_CONFIG } from "../config/server.config.js";

export interface TokenPayload {
  userId?: string;
  id?: string;
  role?: string;
  organizationId?: string;
  [key: string]: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const generateToken = (payload: TokenPayload): AuthTokens => {
  const accessSecret: Secret = SERVER_CONFIG.JWT_ACCESS_SECRET || "default_access_secret";
  const refreshSecret: Secret = SERVER_CONFIG.JWT_REFRESH_SECRET || "default_refresh_secret";

  const accessOptions: SignOptions = {
    expiresIn: "15m",
    jwtid: crypto.randomUUID(),
  };

  const refreshOptions: SignOptions = {
    expiresIn: "7d",
    jwtid: crypto.randomUUID(),
  };

  const accessToken = jwt.sign(payload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(payload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};