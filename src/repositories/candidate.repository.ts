import { Candidate, CandidateStage, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface CandidateFilters {
  stage?: CandidateStage;
  jobId?: string;
}

export const create = async (
  data: Prisma.CandidateUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<Candidate> => {
  const db = tx || prisma;
  return db.candidate.create({
    data,
  });
};

export const findByJobId = async (jobId: string): Promise<Candidate[]> => {
  return prisma.candidate.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
};

export const findByOrganizationIdWithFilters = async (
  organizationId: string,
  filters: CandidateFilters
): Promise<Candidate[]> => {
  const whereClause: Prisma.CandidateWhereInput = {
    organizationId,
  };

  if (filters.stage) {
    whereClause.currentStage = filters.stage;
  }

  if (filters.jobId) {
    whereClause.jobId = filters.jobId;
  }

  return prisma.candidate.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (
  candidateId: string,
  tx?: Prisma.TransactionClient
): Promise<Candidate | null> => {
  const db = tx || prisma;
  return db.candidate.findUnique({
    where: { id: candidateId },
  });
};