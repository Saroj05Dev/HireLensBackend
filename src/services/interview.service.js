import ApiError from "../utils/ApiError.js";
import * as interviewRepository from "../repositories/interview.repository.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as feedbackRepository from "../repositories/feedback.repository.js";

export const assignInterviewer = async (
    user,
    { candidateId, interviewerId, scheduledAt }
) => {
    const candidate = await candidateRepository.findById(candidateId);

    if(
        !candidate ||
        candidate.organizationId.toString() !== user.organizationId
    ) {
        throw new ApiError(404, "Candidate not found in your organization");
    }

    const interviewer = await userRepository.findById(interviewerId);


    if(
        !interviewer ||
        interviewer.organizationId.toString() !== user.organizationId ||
        interviewer.role !== "INTERVIEWER"
    ) {
        throw new ApiError(400, "Invalid interviewer");
    }

    return interviewRepository.create({
        organizationId: user.organizationId,
        candidateId,
        jobId: candidate.jobId,
        interviewerId,
        scheduledAt
    });
};

export const submitFeedback = async (
  user,
  interviewId,
  { rating, comment, recommendation }
) => {
  const interview = await interviewRepository.findById(interviewId);


  if (
    !interview ||
    interview.interviewerId.toString() !== user.id
  ) {
    throw new ApiError(403, "Not authorized to submit feedback");
  }

  const feedback = await feedbackRepository.create({
    interviewId,
    candidateId: interview.candidateId,
    interviewerId: user.id,
    rating,
    comment,
    recommendation
  });

  interview.status = "COMPLETED";
  await interview.save();

  return feedback;
};