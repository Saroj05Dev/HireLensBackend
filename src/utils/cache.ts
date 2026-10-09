import { redis } from "../config/redis.js";

export const getCached = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redis.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[Cache] Invalid JSON for key ${key}:`, error);
      await deleteCached(key);
      return null;
    }
  } catch (error) {
    console.error(`[Cache] Read failed for key ${key}:`, error);
    return null;
  }
};

export const setCached = async <T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error(`[Cache] Write failed for key ${key}:`, error);
  }
};

export const deleteCached = async (...keys: string[]): Promise<void> => {
  if (!keys.length) return;

  try {
    await redis.del(keys);
  } catch (error) {
    console.error("[Cache] Invalidation failed:", error);
  }
};
