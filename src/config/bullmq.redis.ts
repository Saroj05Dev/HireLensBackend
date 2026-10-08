import { Redis } from "ioredis";
import { SERVER_CONFIG } from './server.config.js';

export const bullmqConnection = new Redis(
    SERVER_CONFIG.REDIS_URL || 'redis://localhost:6379',
    {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    }
);

bullmqConnection.on("error", (error: Error) => {
    console.error("[BullMQ Redis] connection error: ", error);
});