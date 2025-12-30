import DecisionLog from "../models/DecisionLog.js";

export const create = async (data, session) => {
  const log = new DecisionLog(data);
  await log.save({ session });
  return log;
};

export const findByCandidateId = async (candidateId) => {
  return DecisionLog.find({ candidateId })
    .populate("performedBy", "name")
    .sort({ createdAt: -1 });
};

/**
 * Candidate stage history
 */
export const findStageChangesByCandidate = async (
  candidateId,
  organizationId
) => {
  return DecisionLog.find({
    candidateId,
    organizationId,
    actionType: "STAGE_CHANGE"
  }).sort({ createdAt: 1 });
};

/**
 * Job funnel stage changes
 */
export const findStageChangesByJob = async (jobId, organizationId) => {
  return DecisionLog.find({
    jobId,
    organizationId,
    actionType: "STAGE_CHANGE"
  });
};

/**
 * Latest stage per candidate (org-wide)
 */
export const findLatestStagePerCandidate = async (organizationId) => {
  return DecisionLog.aggregate([
    { $match: { organizationId, actionType: "STAGE_CHANGE" } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$candidateId",
        toStage: { $first: "$toStage" }
      }
    }
  ]);
};