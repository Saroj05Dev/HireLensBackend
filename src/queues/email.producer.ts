import type { Job } from "bullmq";
import { emailQueue } from "./email.queue.js";
import type {
  EmailJobData,
  EmailJobName,
  InterviewScheduledEmailJobData,
  InviteEmailJobData,
  OtpEmailJobData,
  StageChangeEmailJobData,
} from "./email.types.js";

const addEmailJob = async <T extends EmailJobData>(
  name: EmailJobName,
  data: T,
  jobId: string
): Promise<Job<EmailJobData, unknown, EmailJobName>> => {
  return emailQueue.add(name, data, {
    jobId,
  });
};

export const queueOtpEmail = async (
  data: OtpEmailJobData
): Promise<Job<EmailJobData, unknown, EmailJobName>> => {
  return addEmailJob(
    "otp",
    data,
    `otp:${data.purpose ?? "SIGNUP"}:${data.email.toLowerCase().trim()}:${data.otp}`
  );
};

export const queueInviteEmail = async (
  data: InviteEmailJobData
): Promise<Job<EmailJobData, unknown, EmailJobName>> => {
  return addEmailJob(
    "invite",
    data,
    `invite:${data.email.toLowerCase().trim()}:${data.inviteUrl}`
  );
};

export const queueInterviewScheduledEmail = async (
  data: InterviewScheduledEmailJobData
): Promise<Job<EmailJobData, unknown, EmailJobName>> => {
  return addEmailJob(
    "interview-scheduled",
    data,
    `interview:${data.interviewerEmail}:${data.scheduledAt}`
  );
};

export const queueStageChangeEmail = async (
  data: StageChangeEmailJobData
): Promise<Job<EmailJobData, unknown, EmailJobName>> => {
  return addEmailJob(
    "stage-change",
    data,
    `stage-change:${data.candidateEmail}:${data.toStage}:${Date.now()}`
  );
};