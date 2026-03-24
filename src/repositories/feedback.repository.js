import InterviewFeedback from "../models/InterviewFeedback.js";

export const create = async (data) => {
  const feedback = new InterviewFeedback(data);
  await feedback.save();
  return feedback;
};

export const findByInterviewId = async (interviewId) => {
  return InterviewFeedback.findOne({ interviewId });
};