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

  // 3 Check if interview already exists for this candidate with this interviewer
  const existingInterview = await interviewRepository.findByCandidateAndInterviewer(
    candidateId,
    interviewerId
  );

  if (existingInterview) {
    throw new ApiError(400, "Interview already assigned to this interviewer for this candidate");
  }

  // 4 Core DB write (Interview assignment)
  const interview = await interviewRepository.create({
    organizationId: user.organizationId,
    candidateId,
    jobId: candidate.jobId,
    interviewerId,
    scheduledAt,
  });

  // 5 Decision Log
  await decisionLogRepository.create({
    organizationId: user.organizationId,
    candidateId,
    jobId: candidate.jobId,
    actionType: "INTERVIEW_ASSIGNED",
    performedBy: user.id,
    note: `Interview assigned to ${interviewer.name}`,
  });

  const io = getIO();

  io.to(`org:${user.organizationId}`).emit("decision:created", {
    action: "INTERVIEW_ASSIGNED",
    candidateId,
    jobId: candidate.jobId,
    performedBy: user.id,
    from: null,
    to: null,
    note: `Interview assigned to ${interviewer.name}`,
    timestamp: new Date(),
  });

  // 6 Real-time events (SIDE EFFECT)

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
    interviewerId,
    scheduledAt,
  });

  // Create notification for interviewer
  await notificationService.notifyInterviewAssignment({
    interviewerId,
    candidateName: candidate.name,
    jobTitle: candidate.jobId?.title || "Unknown Job",
    interviewDate: scheduledAt,
    organizationId: user.organizationId,
    metadata: {
      interviewId: interview._id,
      candidateId,
      jobId: candidate.jobId
    }
  });

  // Send interview scheduled email to the interviewer (fire-and-forget)
  const [job, organization] = await Promise.all([
    jobRepository.findById(candidate.jobId),
    organizationRepository.findById(user.organizationId),
  ]);

  sendInterviewScheduledEmail({
    interviewerEmail: interviewer.email,
    interviewerName: interviewer.name,
    candidateName: candidate.name,
    jobTitle: job?.title || "Unknown Position",
    scheduledAt,
    organizationName: organization?.name || "HireLens",
  }).catch((err) => console.error("[Email] Interview scheduled email error:", err));

  return interview;
};

/**
 * Submit interview feedback
 * Role: INTERVIEWER
 */
export const submitFeedback = async (
  user,
  interviewId,
  { rating, strengths, weaknesses, recommendation }
) => {
  // 1️ Validate interview ownership
  const interview = await interviewRepository.findById(interviewId);

  if (!interview || interview.interviewerId.toString() !== user.id) {
    throw new ApiError(403, "Not authorized to submit feedback");
  }

  // 2️ Core DB write (Feedback) — contract compliant
  const feedback = await feedbackRepository.create({
    interviewId,
    candidateId: interview.candidateId,
    interviewerId: user.id,
    rating,
    strengths,
    weaknesses,
    recommendation,
  });

  // 3️ Update interview status
  interview.status = "COMPLETED";
  await interview.save();

  // 4️ Decision Log (AUDIT)
  await decisionLogRepository.create({
    organizationId: interview.organizationId,
    candidateId: interview.candidateId,
    jobId: interview.jobId,
    actionType: "FEEDBACK_SUBMITTED",
    performedBy: user.id,
    note: `Recommendation: ${recommendation}`,
  });

  // 5️ Real-time decision feed
  const io = getIO();

  io.to(`org:${interview.organizationId}`).emit("decision:created", {
    action: "FEEDBACK_SUBMITTED",
    candidateId: interview.candidateId,
    jobId: interview.jobId,
    performedBy: user.id,
    from: null,
    to: null,
    note: `Recommendation: ${recommendation}`,
    timestamp: new Date(),
  });

  // 6️ Real-time feedback-specific event
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

  // 7️ Create notification for recruiters
  // Get all recruiters in the organization
  const recruiters = await userRepository.findByOrganizationAndRole(
    interview.organizationId,
    "RECRUITER"
  );
  
  const candidate = await candidateRepository.findById(interview.candidateId);
  
  // Get interviewer details for notification
  const interviewer = await userRepository.findById(user.id);
  
  // Notify each recruiter
  for (const recruiter of recruiters) {
    await notificationService.notifyFeedbackSubmitted({
      recruiterId: recruiter._id,
      candidateName: candidate.name,
      interviewerName: interviewer?.name || 'An interviewer',
      organizationId: interview.organizationId,
      metadata: {
        interviewId,
        candidateId: interview.candidateId,
        feedbackId: feedback._id,
        rating,
        recommendation
      }
    });
  }

  return feedback;
};

/**
 * Get my assigned interviews
 * Role: INTERVIEWER
 */
export const getMyInterviews = async (user) => {
  const interviews = await interviewRepository.findByInterviewerId(user.id);
  return interviews;
};

/**
 * Get interviews for a specific job
 * Role: RECRUITER
 */
export const getInterviewsByJob = async (user, jobId) => {
  const interviews = await interviewRepository.findByJobId(jobId);
  
  // Filter by organization
  return interviews.filter(
    (interview) => interview.organizationId.toString() === user.organizationId
  );
};

/**
 * Get feedback for an interview
 * Role: RECRUITER, INTERVIEWER
 */
export const getInterviewFeedback = async (user, interviewId) => {
  const interview = await interviewRepository.findById(interviewId);
  
  if (!interview || interview.organizationId.toString() !== user.organizationId) {
    throw new ApiError(404, "Interview not found");
  }
  
  const feedback = await feedbackRepository.findByInterviewId(interviewId);
  
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }
  
  return feedback;
};

/**
 * Get all interviews in the organization (with optional filters)
 * Role: ADMIN, RECRUITER
 */
export const getAllInterviews = async (user, filters) => {
  return interviewRepository.findByOrganization(user.organizationId, filters);
};

/**
 * Get all interviewers in the organization
 * Role: RECRUITER
 */
export const getInterviewers = async (user) => {
  const interviewers = await userRepository.findByOrganizationAndRole(
    user.organizationId,
    "INTERVIEWER"
  );
  
  return interviewers.map(interviewer => ({
    _id: interviewer._id,
    name: interviewer.name,
    email: interviewer.email
  }));
};
