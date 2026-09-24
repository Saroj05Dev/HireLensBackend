import { CandidateStage, JobStatus, InterviewStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  activeCandidates: number;
  totalInterviews: number;
  pendingInterviews: number;
}

export interface StageCount {
  stage: CandidateStage;
  count: number;
}

/**
 * Get dashboard statistics for an organization
 */
export const getDashboardStats = async (
  organizationId: string
): Promise<DashboardStats> => {
  const activeStages: CandidateStage[] = [
    CandidateStage.APPLIED,
    CandidateStage.SCREENING,
    CandidateStage.INTERVIEW,
    CandidateStage.OFFER,
  ];

  const [
    totalJobs,
    openJobs,
    totalCandidates,
    activeCandidates,
    totalInterviews,
    pendingInterviews,
  ] = await Promise.all([
    prisma.job.count({
      where: { organizationId },
    }),
    prisma.job.count({
      where: { organizationId, status: JobStatus.OPEN },
    }),
    prisma.candidate.count({
      where: { organizationId },
    }),
    prisma.candidate.count({
      where: {
        organizationId,
        currentStage: { in: activeStages },
      },
    }),
    prisma.interview.count({
      where: { organizationId },
    }),
    prisma.interview.count({
      where: { organizationId, status: InterviewStatus.ASSIGNED },
    }),
  ]);

  return {
    totalJobs,
    openJobs,
    totalCandidates,
    activeCandidates,
    totalInterviews,
    pendingInterviews,
  };
};

/**
 * Get recent decision logs (activity feed)
 */
export const getRecentActivity = async (
  organizationId: string,
  limit: number = 10
) => {
  return prisma.decisionLog.findMany({
    where: { organizationId },
    include: {
      performedBy: {
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
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

/**
 * Get candidates by stage breakdown
 */
export const getCandidatesByStage = async (
  organizationId: string
): Promise<StageCount[]> => {
  const stageGroups = await prisma.candidate.groupBy({
    by: ["currentStage"],
    where: { organizationId },
    _count: {
      _all: true,
    },
    orderBy: {
      currentStage: "asc",
    },
  });

  return stageGroups.map((group) => ({
    stage: group.currentStage,
    count: group._count._all,
  }));
};