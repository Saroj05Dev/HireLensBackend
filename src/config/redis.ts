import { createClient } from 'redis';
import { SERVER_CONFIG } from './server.config.js';

export const redis = createClient({
    url: SERVER_CONFIG.REDIS_URL,
    socket: {
        connectTimeout: 10000,
        reconnectStrategy: false,
    },
});

redis.on("error", (error) => {
    console.error("[Redis] Client error:", error);
});

export const connectRedis = async (): Promise<void> => {
    if (!redis.isOpen) {
        try {
            await redis.connect();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(
                `Redis connection failed. Check REDIS_URL and Redis availability. ${message}`,
                { cause: error }
            );
        }
        console.log("[Redis] Connected successfully.");
    }
};