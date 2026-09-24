import { Interview, InterviewStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface InterviewFilters {
  status?: InterviewStatus;
  jobId?: string;
  candidateId?: string;
}

const interviewInclude = {
  interviewer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  candidate: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  job: {
    select: {
      id: true,
      title: true,
    },
  },
};

export const create = async (
  data: Prisma.InterviewUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<Interview> => {
  const db = tx || prisma;
  return db.interview.create({
    data,
  });
};

export const findById = async (interviewId: string) => {
  return prisma.interview.findUnique({
    where: { id: interviewId },
    include: interviewInclude,
  });
};

export const findByCandidateId = async (
  candidateId: string,
  tx?: Prisma.TransactionClient
) => {
  const db = tx || prisma;
  return db.interview.findMany({
    where: { candidateId },
    include: interviewInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const findByInterviewerId = async (interviewerId: string) => {
  return prisma.interview.findMany({
    where: { interviewerId },
    include: interviewInclude,
    orderBy: { scheduledAt: "asc" },
  });
};

export const findByJobId = async (jobId: string) => {
  return prisma.interview.findMany({
    where: { jobId },
    include: interviewInclude,
    orderBy: { scheduledAt: "asc" },
  });
};

export const findByOrganization = async (
  organizationId: string,
  filters: InterviewFilters = {}
) => {
  const where: Prisma.InterviewWhereInput = {
    organizationId,
    ...(filters.status && { status: filters.status }),
    ...(filters.jobId && { jobId: filters.jobId }),
    ...(filters.candidateId && { candidateId: filters.candidateId }),
  };

  return prisma.interview.findMany({
    where,
    include: interviewInclude,
    orderBy: { scheduledAt: "asc" },
  });
};

export const findByCandidateAndInterviewer = async (
  candidateId: string,
  interviewerId: string
): Promise<Interview | null> => {
  return prisma.interview.findFirst({
    where: {
      candidateId,
      interviewerId,
    },
  });
};