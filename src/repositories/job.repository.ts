import { Job, JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const jobInclude = {
  createdBy: {
    select: {
      name: true,
      email: true,
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
  return prisma.job.findMany({
    where: { organizationId },
    include: jobInclude,
    orderBy: { createdAt: "desc" },
  });
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