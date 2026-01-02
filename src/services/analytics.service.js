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

export const getTimeToHire = async (user, jobId) => {
  // 1️ Get all STAGE_CHANGE logs for this job
  const logs = await decisionLogRepository.findStageChangesByJob(
    jobId,
    user.organizationId
  );

  if (!logs.length) {
    return {
      jobId,
      averageTimeToHireDays: 0,
      hires: []
    };
  }

  // 2️ Group logs by candidate
  const candidateMap = {};

  logs.forEach(log => {
    const cid = log.candidateId.toString();
    if (!candidateMap[cid]) {
      candidateMap[cid] = [];
    }
    candidateMap[cid].push(log);
  });

  const hires = [];

  // 3️ Compute time-to-hire per candidate
  for (const candidateId in candidateMap) {
    const events = candidateMap[candidateId].sort(
      (a, b) => a.createdAt - b.createdAt
    );

    const start = events[0];
    const hired = events.find(e => e.toStage === "HIRED");

    if (!hired) continue; // not hired → skip

    const durationMs = hired.createdAt - start.createdAt;
    const days = Math.round(durationMs / (1000 * 60 * 60 * 24));

    hires.push({
      candidateId,
      timeToHireDays: days
    });
  }

  // 4️ Average calculation
  const averageTimeToHireDays = hires.length
    ? Math.round(
        hires.reduce((sum, h) => sum + h.timeToHireDays, 0) / hires.length
      )
    : 0;

  return {
    jobId,
    averageTimeToHireDays,
    hires
  };
};