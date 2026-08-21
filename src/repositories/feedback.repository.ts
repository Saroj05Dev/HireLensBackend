import { Types } from "mongoose";
import InterviewFeedback, {
  IInterviewFeedback,
  IInterviewFeedbackDocument,
} from "../models/InterviewFeedback.js";

export const create = async (
  data: Partial<IInterviewFeedback>
): Promise<IInterviewFeedbackDocument> => {
  const feedback = new InterviewFeedback(data);
  await feedback.save();
  return feedback;
};

export const findByInterviewId = async (
  interviewId: string | Types.ObjectId
): Promise<IInterviewFeedbackDocument | null> => {
  return InterviewFeedback.findOne({ interviewId });
};