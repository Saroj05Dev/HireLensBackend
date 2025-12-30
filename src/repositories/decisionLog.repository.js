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

export const findStageChanges = async (candidateId) => {
  return DecisionLog.find({
    candidateId,
    actionType: "STAGE_CHANGE"
  }).sort({ createdAt: 1 });
};
