import { ClientSession, Types } from "mongoose";
import Candidate, {
  CandidateStage,
  ICandidate,
  ICandidateDocument,
} from "../models/Candidate.js";

interface CandidateFilters {
  stage?: CandidateStage;
  jobId?: string | Types.ObjectId;
}

export const create = async (data: Partial<ICandidate>): Promise<ICandidateDocument> => {
  const candidate = new Candidate(data);
  await candidate.save();
  return candidate;
};

export const findByJobId = async (
  jobId: string | Types.ObjectId
): Promise<ICandidateDocument[]> => {
  return Candidate.find({ jobId }).sort({ createdAt: -1 });
};

export const findByOrganizationIdWithFilters = async (
  organizationId: string | Types.ObjectId,
  filters: CandidateFilters
): Promise<ICandidateDocument[]> => {
  const query: Record<string, any> = { organizationId };

  if (filters.stage) {
    query.currentStage = filters.stage;
  }

  if (filters.jobId) {
    query.jobId = filters.jobId;
  }

  return Candidate.find(query).sort({ createdAt: -1 });
};

export const findById = async (
  candidateId: string | Types.ObjectId,
  session?: ClientSession
): Promise<ICandidateDocument | null> => {
  const query = Candidate.findById(candidateId);

  if (session) {
    query.session(session);
  }

  return query;
};