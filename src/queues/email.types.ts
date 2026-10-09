export type EmailJobName =
  | "otp"
  | "invite"
  | "interview-scheduled"
  | "stage-change";

export interface OtpEmailJobData {
  email: string;
  otp: string;
  purpose?: "SIGNUP" | "PASSWORD_RESET";
}

export interface InviteEmailJobData {
  email: string;
  role: string;
  organizationName: string;
  inviteUrl: string;
  expiresAt: Date | string;
}

export interface InterviewScheduledEmailJobData {
  interviewerEmail: string;
  interviewerName: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date | string;
  organizationName: string;
}

export interface StageChangeEmailJobData {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  fromStage: string;
  toStage: string;
  organizationName: string;
  note?: string;
}

export type EmailJobData =
  | OtpEmailJobData
  | InviteEmailJobData
  | InterviewScheduledEmailJobData
  | StageChangeEmailJobData;