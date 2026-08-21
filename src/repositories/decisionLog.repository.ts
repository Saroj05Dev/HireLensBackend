import { ClientSession, Types } from "mongoose";
import DecisionLog, { IDecisionLog, IDecisionLogDocument } from "../models/DecisionLog.js";

export const create = async (
  data: Partial<IDecisionLog>,
  session?: ClientSession
): Promise<IDecisionLogDocument> => {
  const log = new DecisionLog(data);
  await log.save({ session });
  return log;
};

export const findByCandidateId = async (
  candidateId: string | Types.ObjectId
): Promise<IDecisionLogDocument[]> => {
  return DecisionLog.find({ candidateId })
    .populate("performedBy", "name")
    .sort({ createdAt: -1 });
};

/**
 * Candidate stage history
 */
export const findStageChangesByCandidate = async (
  candidateId: string | Types.ObjectId,
  organizationId: string | Types.ObjectId
): Promise<IDecisionLogDocument[]> => {
  return DecisionLog.find({
    candidateId,
    organizationId,
    actionType: "STAGE_CHANGE",
  }).sort({ createdAt: 1 });
};

/**
 * Job funnel stage changes
 */
export const findStageChangesByJob = async (
  jobId: string | Types.ObjectId,
  organizationId: string | Types.ObjectId
): Promise<IDecisionLogDocument[]> => {
  return DecisionLog.find({
    jobId,
    organizationId,
    actionType: "STAGE_CHANGE",
  });
};

/**
 * Latest stage per candidate (org-wide)
 */
export const findLatestStagePerCandidate = async (
  organizationId: string | Types.ObjectId
) => {
  const orgId = typeof organizationId === "string" ? new Types.ObjectId(organizationId) : organizationId;
  return DecisionLog.aggregate([
    { $match: { organizationId: orgId, actionType: "STAGE_CHANGE" } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$candidateId",
        toStage: { $first: "$toStage" },
      },
    },
  ]);
};

/**
 * Organization-wide stage changes
 */
export const findStageChangesByOrganization = async (
  organizationId: string | Types.ObjectId
): Promise<IDecisionLogDocument[]> => {
  return DecisionLog.find({
    organizationId,
    actionType: "STAGE_CHANGE",
  }).sort({ createdAt: 1 });
};