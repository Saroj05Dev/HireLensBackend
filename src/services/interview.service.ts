import { Recommendation, InterviewStatus, ActionType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { getIO } from "../config/socket.js";
import * as interviewRepository from "../repositories/interview.repository.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as feedbackRepository from "../repositories/feedback.repository.js";
import * as decisionLogRepository from "../repositories/decisionLog.repository.js";
import * as notificationService from "./notification.service.js";
import * as jobRepository from "../repositories/job.repository.js";
import * as organizationRepository from "../repositories/organization.repository.js";
import { sendInterviewScheduledEmail } from "./email.service.js";

interface UserContext {
  id: string;
  organizationId: string;
  [key: string]: any;
}

export const assignInterviewer = async (
  user: UserContext,
  {
    candidateId,
    interviewerId,
    scheduledAt,
  }: { candidateId: string; interviewerId: string; scheduledAt?: Date | string }
) => {
  const candidate = await candidateRepository.findById(candidateId);

  if (!candidate || candidate.organizationId !== user.organizationId) {
    throw new ApiError(404, "Candidate not found in your organization");
  }

  const interviewer = await userRepository.findById(interviewerId);

  if (
    !interviewer ||
    interviewer.organizationId !== user.organizationId ||
    interviewer.role !== "INTERVIEWER"
  ) {
    throw new ApiError(400, "Invalid interviewer");
  }

  const existingInterview = await interviewRepository.findByCandidateAndInterviewer(
    candidateId,
    interviewerId
  );

  if (existingInterview) {
    throw new ApiError(400, "Interview already assigned to this interviewer for this candidate");
  }

  const interview = await interviewRepository.create({
    organizationId: user.organizationId,
    candidateId,
    jobId: candidate.jobId,
    interviewerId,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
  });

  // Fetch the interview with populated relationships
  const populatedInterview = await interviewRepository.findById(interview.id);

  await decisionLogRepository.create({
    organizationId: user.organizationId,
    candidateId,
    jobId: candidate.jobId,
    actionType: ActionType.INTERVIEW_ASSIGNED,
    performedById: user.id,
    note: `Interview assigned to ${interviewer.name}`,
  });

  const io = getIO();

  io.to(`org:${user.organizationId}`).emit("decision:created", {
    action: ActionType.INTERVIEW_ASSIGNED,
    candidateId,
    jobId: candidate.jobId,
    performedBy: user.id,
    from: null,
    to: null,
    note: `Interview assigned to ${interviewer.name}`,
    timestamp: new Date(),
  });

  io.to(`org:${user.organizationId}`).emit("interview:assigned", {
    interviewId: interview.id,
    candidateId,
    jobId: candidate.jobId,
    interviewerId,
    assignedBy: user.id,
    scheduledAt,
  });

  io.to(`user:${interviewerId}`).emit("interview:assigned", {
    interviewId: interview.id,
    candidateId,
    jobId: candidate.jobId,
    interviewerId,
    scheduledAt,
  });

  const job = await jobRepository.findById(candidate.jobId);

  await notificationService.notifyInterviewAssignment({
    interviewerId,
    candidateName: candidate.name,
    jobTitle: job?.title || "Unknown Job",
    interviewDate: scheduledAt || new Date(),
    organizationId: user.organizationId,
    metadata: {
      interviewId: interview.id,
      candidateId,
      jobId: candidate.jobId,
    },
  });

  const organization = await organizationRepository.findById(user.organizationId);

  sendInterviewScheduledEmail({
    interviewerEmail: interviewer.email,
    interviewerName: interviewer.name || "Interviewer",
    candidateName: candidate.name,
    jobTitle: job?.title || "Unknown Position",
    scheduledAt: scheduledAt || new Date(),
    organizationName: organization?.name || "HireLens",
  }).catch((err) => console.error("[Email] Interview scheduled email error:", err));

  return populatedInterview;
};

export const submitFeedback = async (
  user: UserContext,
  interviewId: string,
  {
    rating,
    strengths,
    weaknesses,
    recommendation,
  }: {
    rating: number;
    strengths: string;
    weaknesses: string;
    recommendation: Recommendation;
  }
) => {
  const interview = await interviewRepository.findById(interviewId);

  if (!interview || interview.interviewerId !== user.id) {
    throw new ApiError(403, "Not authorized to submit feedback");
  }

  return prisma.$transaction(async (tx) => {
    const feedback = await feedbackRepository.create(
      {
        interviewId,
        candidateId: interview.candidateId,
        interviewerId: user.id,
        rating,
        strengths,
        weaknesses,
        recommendation,
      },
      tx
    );

    await tx.interview.update({
      where: { id: interviewId },
      data: { status: InterviewStatus.COMPLETED },
    });

    await decisionLogRepository.create(
      {
        organizationId: interview.organizationId,
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        actionType: ActionType.FEEDBACK_SUBMITTED,
        performedById: user.id,
        note: `Recommendation: ${recommendation}`,
      },
      tx
    );

    const io = getIO();

    io.to(`org:${interview.organizationId}`).emit("decision:created", {
      action: ActionType.FEEDBACK_SUBMITTED,
      candidateId: interview.candidateId,
      jobId: interview.jobId,
      performedBy: user.id,
      from: null,
      to: null,
      note: `Recommendation: ${recommendation}`,
      timestamp: new Date(),
    });

    io.to(`org:${interview.organizationId}`).emit("feedback:submitted", {
      interviewId,
      candidateId: interview.candidateId,
      interviewerId: user.id,
      rating,
      strengths,
      weaknesses,
      recommendation,
      submittedAt: new Date(),
    });

    const recruiters = await userRepository.findByOrganizationAndRole(
      interview.organizationId,
      "RECRUITER"
    );

    const candidate = await candidateRepository.findById(interview.candidateId, tx);
    const interviewer = await userRepository.findById(user.id);

    for (const recruiter of recruiters) {
      await notificationService.notifyFeedbackSubmitted({
        recruiterId: recruiter.id,
        candidateName: candidate?.name || "Candidate",
        interviewerName: interviewer?.name || "An interviewer",
        organizationId: interview.organizationId,
        metadata: {
          interviewId,
          candidateId: interview.candidateId,
          feedbackId: feedback.id,
          rating,
          recommendation,
        },
      });
    }

    return feedback;
  });
};

export const getMyInterviews = async (user: UserContext) => {
  return await interviewRepository.findByInterviewerId(user.id);
};

export const getInterviewsByJob = async (user: UserContext, jobId: string) => {
  const interviews = await interviewRepository.findByJobId(jobId);
  return interviews.filter(
    (interview) => interview.organizationId === user.organizationId
  );
};

export const getInterviewFeedback = async (user: UserContext, interviewId: string) => {
  const interview = await interviewRepository.findById(interviewId);

  if (!interview || interview.organizationId !== user.organizationId) {
    throw new ApiError(404, "Interview not found");
  }

  const feedback = await feedbackRepository.findByInterviewId(interviewId);

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  return feedback;
};

export const getAllInterviews = async (
  user: UserContext,
  filters: { status?: InterviewStatus; jobId?: string; candidateId?: string }
) => {
  return interviewRepository.findByOrganization(user.organizationId, filters);
};

export const getInterviewers = async (user: UserContext) => {
  const interviewers = await userRepository.findByOrganizationAndRole(
    user.organizationId,
    "INTERVIEWER"
  );

  return interviewers.map((interviewer) => ({
    id: interviewer.id,
    name: interviewer.name,
    email: interviewer.email,
  }));
};