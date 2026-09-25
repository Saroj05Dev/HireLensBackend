import { Job, JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const jobInclude = {
  createdBy: {
    select: {
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      candidates: true,
    },
  },
};

export const create = async (
  jobData: Prisma.JobUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<Job> => {
  const db = tx || prisma;
  return db.job.create({
    data: jobData,
  });
};

export const findByOrganizationId = async (organizationId: string) => {
  console.log('Fetching jobs for organization:', organizationId);
  
  // First, let's check how many candidates exist for this organization
  const candidateCount = await prisma.candidate.count({
    where: { organizationId }
  });
  console.log('Total candidates in organization:', candidateCount);
  
  // Get candidates grouped by job
  const candidatesByJob = await prisma.candidate.groupBy({
    by: ['jobId'],
    where: { organizationId },
    _count: { id: true }
  });
  console.log('Candidates by job:', candidatesByJob);
  
  const jobs = await prisma.job.findMany({
    where: { organizationId },
    include: jobInclude,
    orderBy: { createdAt: "desc" },
  });
  
  console.log('Jobs found:', jobs.length);
  console.log('Jobs with counts:', jobs.map(job => ({
    id: job.id,
    title: job.title,
    candidateCount: (job as any)._count?.candidates || 0
  })));
  
  return jobs;
};

export const findById = async (jobId: string) => {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: jobInclude,
  });
};

export const updateStatus = async (
  jobId: string,
  status: JobStatus,
  tx?: Prisma.TransactionClient
): Promise<Job | null> => {
  const db = tx || prisma;
  return db.job.update({
    where: { id: jobId },
    data: { status },
  });
};

export const update = async (
  jobId: string,
  jobData: Prisma.JobUpdateInput,
  tx?: Prisma.TransactionClient
) => {
  const db = tx || prisma;
  return db.job.update({
    where: { id: jobId },
    data: jobData,
    include: jobInclude,
  });
};

export const deleteById = async (
  jobId: string,
  tx?: Prisma.TransactionClient
): Promise<Job | null> => {
  const db = tx || prisma;
  return db.job.delete({
    where: { id: jobId },
  });
};