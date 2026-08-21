import * as decisionLogRepository from "../repositories/decisionLog.repository.js";
import * as analyticsRepository from "../repositories/analytics.repository.js";

interface UserContext {
  organizationId: string;
  id?: string;
  [key: string]: any;
}

export const getCandidateTimeInStage = async (user: UserContext, candidateId: string) => {
  const logs = await decisionLogRepository.findStageChangesByCandidate(
    candidateId,
    user.organizationId
  );

  if (!logs.length) {
    return { candidateId, stages: [] };
  }

  const stages: Array<{ stage?: string; durationHours: number }> = [];

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    const next = logs[i + 1];

    const currentCreatedAt = current.createdAt ? new Date(current.createdAt).getTime() : Date.now();
    const endTime = next && next.createdAt ? new Date(next.createdAt).getTime() : Date.now();
    const durationMs = endTime - currentCreatedAt;

    stages.push({
      stage: current.toStage,
      durationHours: Math.round(durationMs / (1000 * 60 * 60)),
    });
  }

  return { candidateId, stages };
};

export const getJobFunnel = async (user: UserContext, jobId: string) => {
  const logs = await decisionLogRepository.findStageChangesByJob(
    jobId,
    user.organizationId
  );

  const funnelMap: Record<string, Set<string>> = {};

  logs.forEach((log) => {
    if (log.toStage) {
      if (!funnelMap[log.toStage]) {
        funnelMap[log.toStage] = new Set();
      }
      funnelMap[log.toStage].add(log.candidateId.toString());
    }
  });

  const funnel: Record<string, number> = {};
  for (const stage in funnelMap) {
    funnel[stage] = funnelMap[stage].size;
  }

  return { jobId, funnel };
};

export const getPipelineSummary = async (user: UserContext) => {
  const logs = await decisionLogRepository.findLatestStagePerCandidate(
    user.organizationId
  );

  const summary: Record<string, number> = {};

  logs.forEach((log: { toStage: string }) => {
    if (log.toStage) {
      summary[log.toStage] = (summary[log.toStage] || 0) + 1;
    }
  });

  return summary;
};

export const getTimeToHire = async (user: UserContext, jobId: string) => {
  const logs = await decisionLogRepository.findStageChangesByJob(
    jobId,
    user.organizationId
  );

  if (!logs.length) {
    return {
      jobId,
      averageTimeToHireDays: 0,
      hires: [],
    };
  }

  const candidateMap: Record<string, typeof logs> = {};

  logs.forEach((log) => {
    const cid = log.candidateId.toString();
    if (!candidateMap[cid]) {
      candidateMap[cid] = [];
    }
    candidateMap[cid].push(log);
  });

  const hires: Array<{ candidateId: string; timeToHireDays: number }> = [];

  for (const candidateId in candidateMap) {
    const events = candidateMap[candidateId].sort(
      (a, b) => (new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime())
    );

    const start = events[0];
    const hired = events.find((e) => e.toStage === "HIRED");

    if (!hired || !hired.createdAt || !start.createdAt) continue;

    const durationMs = new Date(hired.createdAt).getTime() - new Date(start.createdAt).getTime();
    const days = Math.round(durationMs / (1000 * 60 * 60 * 24));

    hires.push({
      candidateId,
      timeToHireDays: days,
    });
  }

  const averageTimeToHireDays = hires.length
    ? Math.round(hires.reduce((sum, h) => sum + h.timeToHireDays, 0) / hires.length)
    : 0;

  return {
    jobId,
    averageTimeToHireDays,
    hires,
  };
};

export const getOrganizationTimeToHire = async (user: UserContext) => {
  const logs = await decisionLogRepository.findStageChangesByOrganization(
    user.organizationId
  );

  if (!logs.length) {
    return {
      averageTimeToHireDays: 0,
      hires: [],
    };
  }

  const candidateMap: Record<string, typeof logs> = {};

  logs.forEach((log) => {
    const cid = log.candidateId.toString();
    if (!candidateMap[cid]) {
      candidateMap[cid] = [];
    }
    candidateMap[cid].push(log);
  });

  const hires: Array<{ candidateId: string; timeToHireDays: number }> = [];

  for (const candidateId in candidateMap) {
    const events = candidateMap[candidateId].sort(
      (a, b) => (new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime())
    );

    const start = events[0];
    const hired = events.find((e) => e.toStage === "HIRED");

    if (!hired || !hired.createdAt || !start.createdAt) continue;

    const durationMs = new Date(hired.createdAt).getTime() - new Date(start.createdAt).getTime();
    const days = Math.round(durationMs / (1000 * 60 * 60 * 24));

    hires.push({
      candidateId,
      timeToHireDays: days,
    });
  }

  const averageTimeToHireDays = hires.length
    ? Math.round(hires.reduce((sum, h) => sum + h.timeToHireDays, 0) / hires.length)
    : 0;

  return {
    averageTimeToHireDays,
    hires,
  };
};

export const getDashboardStats = async (user: UserContext) => {
  return await analyticsRepository.getDashboardStats(user.organizationId);
};

export const getRecentActivity = async (user: UserContext, limit: number = 10) => {
  return await analyticsRepository.getRecentActivity(user.organizationId, limit);
};

export const getCandidatesByStage = async (user: UserContext) => {
  return await analyticsRepository.getCandidatesByStage(user.organizationId);
};