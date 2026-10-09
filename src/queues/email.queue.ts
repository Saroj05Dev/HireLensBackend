import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmq.redis.js";
import type {
  EmailJobData,
  EmailJobName,
} from "./email.types.js";

export const EMAIL_QUEUE_NAME = "email";

export const emailQueue = new Queue<EmailJobData, unknown, EmailJobName>(
  EMAIL_QUEUE_NAME,
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 24 * 60 * 60,
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60,
      },
    },
  }
);

emailQueue.on("error", (error) => {
  console.error("[Email Queue] Error:", error);
});