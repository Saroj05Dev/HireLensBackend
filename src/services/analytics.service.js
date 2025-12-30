import * as decisionLogRepository from "../repositories/decisionLog.repository.js";

export const getCandidateTimeInStage = async (user, candidateId) => {
  const logs = await decisionLogRepository.findStageChangesByCandidate(
    candidateId,
    user.organizationId
  );

  if (!logs.length) {
    return { candidateId, stages: [] };
  }

  const stages = [];

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    const next = logs[i + 1];

    const endTime = next ? next.createdAt : new Date();
    const durationMs = endTime - current.createdAt;

    stages.push({
      stage: current.toStage,
      durationHours: Math.round(durationMs / (1000 * 60 * 60))
    });
  }

  return { candidateId, stages };
};

export const getJobFunnel = async (user, jobId) => {
  const logs = await decisionLogRepository.findStageChangesByJob(
    jobId,
    user.organizationId
  );

  const funnelMap = {};

  logs.forEach(log => {
    if (!funnelMap[log.toStage]) {
      funnelMap[log.toStage] = new Set();
    }
    funnelMap[log.toStage].add(log.candidateId.toString());
  });

  const funnel = {};
  for (const stage in funnelMap) {
    funnel[stage] = funnelMap[stage].size;
  }

  return { jobId, funnel };
};

export const getPipelineSummary = async (user) => {
  const logs = await decisionLogRepository.findLatestStagePerCandidate(
    user.organizationId
  );

  const summary = {};

  logs.forEach(log => {
    summary[log.toStage] = (summary[log.toStage] || 0) + 1;
  });

  return summary;
};
