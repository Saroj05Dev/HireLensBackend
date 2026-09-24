import { DecisionLog, ActionType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const create = async (
  data: Prisma.DecisionLogUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<DecisionLog> => {
  const db = tx || prisma;
  return db.decisionLog.create({
    data,
  });
};

export const findByCandidateId = async (candidateId: string) => {
  return prisma.decisionLog.findMany({
    where: { candidateId },
    include: {
      performedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Candidate stage history
 */
export const findStageChangesByCandidate = async (
  candidateId: string,
  organizationId: string
): Promise<DecisionLog[]> => {
  return prisma.decisionLog.findMany({
    where: {
      candidateId,
      organizationId,
      actionType: ActionType.STAGE_CHANGE,
    },
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Job funnel stage changes
 */
export const findStageChangesByJob = async (
  jobId: string,
  organizationId: string
): Promise<DecisionLog[]> => {
  return prisma.decisionLog.findMany({
    where: {
      jobId,
      organizationId,
      actionType: ActionType.STAGE_CHANGE,
    },
  });
};

/**
 * Latest stage per candidate (org-wide)
 */
export const findLatestStagePerCandidate = async (
  organizationId: string
): Promise<{ candidateId: string; toStage: string | null }[]> => {
  const latestLogs = await prisma.decisionLog.findMany({
    where: {
      organizationId,
      actionType: ActionType.STAGE_CHANGE,
    },
    distinct: ["candidateId"],
    orderBy: [{ candidateId: "asc" }, { createdAt: "desc" }],
    select: {
      candidateId: true,
      toStage: true,
    },
  });

  return latestLogs.map((log) => ({
    candidateId: log.candidateId,
    toStage: log.toStage,
  }));
};

/**
 * Organization-wide stage changes
 */
export const findStageChangesByOrganization = async (
  organizationId: string
): Promise<DecisionLog[]> => {
  return prisma.decisionLog.findMany({
    where: {
      organizationId,
      actionType: ActionType.STAGE_CHANGE,
    },
    orderBy: { createdAt: "asc" },
  });
};