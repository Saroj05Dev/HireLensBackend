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