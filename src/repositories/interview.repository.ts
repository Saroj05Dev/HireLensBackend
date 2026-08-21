import { Types } from "mongoose";
import Interview, { IInterview, IInterviewDocument, InterviewStatus } from "../models/Interview.js";

interface InterviewFilters {
  status?: InterviewStatus;
  jobId?: string | Types.ObjectId;
  candidateId?: string | Types.ObjectId;
}

export const create = async (data: Partial<IInterview>): Promise<IInterviewDocument> => {
  const interview = new Interview(data);
  await interview.save();
  return interview;
};

export const findById = async (
  interviewId: string | Types.ObjectId
): Promise<IInterviewDocument | null> => {
  return Interview.findById(interviewId);
};

export const findByCandidateId = async (
  candidateId: string | Types.ObjectId
): Promise<IInterviewDocument[]> => {
  return Interview.find({ candidateId })
    .populate("interviewerId", "name email")
    .populate("jobId", "title")
    .populate("candidateId", "name email");
};

export const findByInterviewerId = async (
  interviewerId: string | Types.ObjectId
): Promise<IInterviewDocument[]> => {
  return Interview.find({ interviewerId })
    .populate("candidateId", "name email")
    .populate("jobId", "title")
    .populate("interviewerId", "name email")
    .sort({ scheduledAt: 1 });
};

export const findByJobId = async (
  jobId: string | Types.ObjectId
): Promise<IInterviewDocument[]> => {
  return Interview.find({ jobId })
    .populate("candidateId", "name email")
    .populate("interviewerId", "name email")
    .sort({ scheduledAt: 1 });
};

export const findByOrganization = async (
  organizationId: string | Types.ObjectId,
  filters: InterviewFilters = {}
): Promise<IInterviewDocument[]> => {
  const query: Record<string, any> = { organizationId };
  if (filters.status) query.status = filters.status;
  if (filters.jobId) query.jobId = filters.jobId;
  if (filters.candidateId) query.candidateId = filters.candidateId;

  return Interview.find(query)
    .populate("candidateId", "name email")
    .populate("interviewerId", "name email")
    .populate("jobId", "title")
    .sort({ scheduledAt: 1 });
};

export const findByCandidateAndInterviewer = async (
  candidateId: string | Types.ObjectId,
  interviewerId: string | Types.ObjectId
): Promise<IInterviewDocument | null> => {
  return Interview.findOne({
    candidateId,
    interviewerId,
  });
};