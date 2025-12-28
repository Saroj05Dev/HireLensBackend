import ApiError from "../utils/ApiError.js";
import { getIO } from "../config/socket.js";
import * as interviewRepository from "../repositories/interview.repository.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as feedbackRepository from "../repositories/feedback.repository.js";
import * as decisionLogRepository from "../repositories/decisionLog.repository.js";

/**
 * Assign interviewer to candidate
 * Role: RECRUITER
 */
export const assignInterviewer = async (
  user,
  { candidateId, interviewerId, scheduledAt }
) => {
  // 1 Validate candidate
  const candidate = await candidateRepository.findById(candidateId);

  if (
    !candidate ||
    candidate.organizationId.toString() !== user.organizationId
  ) {
    throw new ApiError(404, "Candidate not found in your organization");
  }

  // 2 Validate interviewer
  const interviewer = await userRepository.findById(interviewerId);

  if (
    !interviewer ||
    interviewer.organizationId.toString() !== user.organizationId ||
    interviewer.role !== "INTERVIEWER"
  ) {
    throw new ApiError(400, "Invalid interviewer");
  }

  // 3 Core DB write (Interview assignment)
  const interview = await interviewRepository.create({
    organizationId: user.organizationId,
    candidateId,
    jobId: candidate.jobId,
    interviewerId,
    scheduledAt,
  });

  // 4 Decision Log (AUDIT — MUST EXIST BEFORE SOCKET)
  await decisionLogRepository.create({
    organizationId: user.organizationId,
    candidateId,
    jobId: candidate.jobId,
    actionType: "INTERVIEW_ASSIGNED",
    performedBy: user.id,
    note: `Interview assigned to interviewer`,
  });

  // 5 Real-time events (SIDE EFFECT)
  const io = getIO();

  // Org-wide activity
  io.to(`org:${user.organizationId}`).emit("interview:assigned", {
    interviewId: interview._id,
    candidateId,
    jobId: candidate.jobId,
    interviewerId,
    assignedBy: user.id,
    scheduledAt,
  });

  // Personal notification
  io.to(`user:${interviewerId}`).emit("interview:assigned", {
    interviewId: interview._id,
    candidateId,
    jobId: candidate.jobId,
    scheduledAt,
  });

  return interview;
};

/**
 * Submit interview feedback
 * Role: INTERVIEWER
 */
export const submitFeedback = async (
  user,
  interviewId,
  { rating, comment, recommendation }
) => {
  // 1 Validate interview ownership
  const interview = await interviewRepository.findById(interviewId);

  if (!interview || interview.interviewerId.toString() !== user.id) {
    throw new ApiError(403, "Not authorized to submit feedback");
  }

  // 2 Core DB write (Feedback)
  const feedback = await feedbackRepository.create({
    interviewId,
    candidateId: interview.candidateId,
    interviewerId: user.id,
    rating,
    comment,
    recommendation,
  });

  // 3 Update interview status
  interview.status = "COMPLETED";
  await interview.save();

  // 4 Decision Log (AUDIT)
  await decisionLogRepository.create({
    organizationId: interview.organizationId,
    candidateId: interview.candidateId,
    jobId: interview.jobId,
    actionType: "FEEDBACK_SUBMITTED",
    performedBy: user.id,
    note: `Feedback submitted: ${recommendation}`,
  });

  // 5 Real-time event
  const io = getIO();

  io.to(`org:${interview.organizationId}`).emit("feedback:submitted", {
    interviewId,
    candidateId: interview.candidateId,
    interviewerId: user.id,
    rating,
    recommendation,
    submittedAt: new Date(),
  });

  return feedback;
};
