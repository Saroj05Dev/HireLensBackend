import { Worker } from "bullmq";
import { bullmqConnection } from "../config/bullmq.redis.js";
import {
  sendInterviewScheduledEmail,
  sendInviteEmail,
  sendOTPEmail,
  sendStageChangeEmail,
} from "../services/email.service.js";
import { EMAIL_QUEUE_NAME } from "../queues/email.queue.js";
import type {
  EmailJobData,
  EmailJobName,
  InterviewScheduledEmailJobData,
  InviteEmailJobData,
  OtpEmailJobData,
  StageChangeEmailJobData,
} from "../queues/email.types.js";

const requireSuccessfulEmail = async (
  send: () => Promise<{ success: boolean; error?: string }>
) => {
  const result = await send();

  if (!result.success) {
    throw new Error(result.error || "Email delivery failed");
  }

  return result;
};

const worker = new Worker<EmailJobData, unknown, EmailJobName>(
  EMAIL_QUEUE_NAME,
  async (job) => {
    switch (job.name) {
      case "otp":
        return requireSuccessfulEmail(() =>
          sendOTPEmail(job.data as OtpEmailJobData)
        );
      case "invite":
        return requireSuccessfulEmail(() =>
          sendInviteEmail(job.data as InviteEmailJobData)
        );
      case "interview-scheduled":
        return requireSuccessfulEmail(() =>
          sendInterviewScheduledEmail(job.data as InterviewScheduledEmailJobData)
        );
      case "stage-change":
        return requireSuccessfulEmail(() =>
          sendStageChangeEmail(job.data as StageChangeEmailJobData)
        );
      default:
        throw new Error(`Unsupported email job: ${job.name}`);
    }
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  }
);

worker.on("ready", () => {
  console.log("[Email Worker] Ready");
});

worker.on("completed", (job) => {
  console.log(`[Email Worker] Completed ${job.name} job ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(
    `[Email Worker] Failed ${job?.name ?? "unknown"} job ${job?.id ?? "unknown"}:`,
    error
  );
});

worker.on("error", (error) => {
  console.error("[Email Worker] Error:", error);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`[Email Worker] Received ${signal}, shutting down...`);
  await worker.close();
  await bullmqConnection.quit();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
