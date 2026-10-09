import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";

const BLACKLIST_PREFIX = "blacklist:";

interface DecodedToken {
  jti?: string;
  exp?: number;
}

const tokenKey = (token: string): string => {
  const decoded = jwt.decode(token) as DecodedToken | null;
  const identifier = decoded?.jti || crypto.createHash("sha256").update(token).digest("hex");
  return `${BLACKLIST_PREFIX}${identifier}`;
};

const tokenTtlSeconds = (token: string): number => {
  const decoded = jwt.decode(token) as DecodedToken | null;
  if (!decoded?.exp) return 0;

  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
};

export const revokeToken = async (token: string): Promise<void> => {
  const ttlSeconds = tokenTtlSeconds(token);
  if (ttlSeconds <= 0) return;

  await redis.set(tokenKey(token), "1", { EX: ttlSeconds });
};

export const isTokenRevoked = async (token: string): Promise<boolean> => {
  return (await redis.exists(tokenKey(token))) === 1;
};
