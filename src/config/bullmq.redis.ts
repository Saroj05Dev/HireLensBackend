import { Redis } from "ioredis";
import { SERVER_CONFIG } from './server.config.js';

export const bullmqConnection = new Redis(
    SERVER_CONFIG.REDIS_URL || 'redis://localhost:6379',
    {
        connectTimeout: 10000,
        keepAlive: 10000,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => Math.min(times * 500, 5000),
    }
);

bullmqConnection.on("error", (error: Error) => {
    console.error("[BullMQ Redis] connection error: ", error);
});