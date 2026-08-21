import mongoose from "mongoose";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import DecisionLog from "../models/DecisionLog.js";

export interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  activeCandidates: number;
  totalInterviews: number;
  pendingInterviews: number;
}

/**
 * Get dashboard statistics for an organization
 */
export const getDashboardStats = async (
  organizationId: string | mongoose.Types.ObjectId
): Promise<DashboardStats> => {
  const orgId = typeof organizationId === "string" ? new mongoose.Types.ObjectId(organizationId) : organizationId;

  const [
    totalJobs,
    openJobs,
    totalCandidates,
    activeCandidates,
    totalInterviews,
    pendingInterviews,
  ] = await Promise.all([
    Job.countDocuments({ organizationId: orgId }),
    Job.countDocuments({ organizationId: orgId, status: "OPEN" }),
    Candidate.countDocuments({ organizationId: orgId }),
    Candidate.countDocuments({
      organizationId: orgId,
      currentStage: { $in: ["APPLIED", "SCREENING", "INTERVIEW", "OFFER"] },
    }),
    Interview.countDocuments({ organizationId: orgId }),
    Interview.countDocuments({ organizationId: orgId, status: "ASSIGNED" }),
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
  organizationId: string | mongoose.Types.ObjectId,
  limit: number = 10
) => {
  const orgId = typeof organizationId === "string" ? new mongoose.Types.ObjectId(organizationId) : organizationId;

  return DecisionLog.find({ organizationId: orgId })
    .populate("performedBy", "name email")
    .populate("candidateId", "name email")
    .populate("jobId", "title")
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get candidates by stage breakdown
 */
export const getCandidatesByStage = async (
  organizationId: string | mongoose.Types.ObjectId
) => {
  const orgId = typeof organizationId === "string" ? new mongoose.Types.ObjectId(organizationId) : organizationId;

  return Candidate.aggregate([
    { $match: { organizationId: orgId } },
    { $group: { _id: "$currentStage", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};