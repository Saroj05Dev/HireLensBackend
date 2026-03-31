import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import DecisionLog from "../models/DecisionLog.js";
import mongoose from "mongoose";

/**
 * Get dashboard statistics for an organization
 */
export const getDashboardStats = async (organizationId) => {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  
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
      stage: { $in: ["APPLIED", "SCREENING", "INTERVIEW", "OFFER"] } 
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
export const getRecentActivity = async (organizationId, limit = 10) => {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  
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
export const getCandidatesByStage = async (organizationId) => {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  
  return Candidate.aggregate([
    { $match: { organizationId: orgId } },
    { $group: { _id: "$stage", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};
