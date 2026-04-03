import * as analyticsService from "../services/analytics.service.js";

export const getCandidateTimeInStage = async (req, res, next) => {
  try {
    const data = await analyticsService.getCandidateTimeInStage(
      req.user,
      req.params.candidateId
    );

    res.status(200).json({
      success: true,
      data,
      message: "Candidate time in stage fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getJobFunnel = async (req, res, next) => {
  try {
    const data = await analyticsService.getJobFunnel(
      req.user,
      req.params.jobId
    );

    res.status(200).json({
      success: true,
      data,
      message: "Job funnel fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getPipelineSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getPipelineSummary(req.user);

    res.status(200).json({
      success: true,
      data,
      message: "Pipeline summary fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getTimeToHire = async (req, res, next) => {
  try {
    const data = await analyticsService.getTimeToHire(
      req.user,
      req.params.jobId
    );

    res.status(200).json({
      success: true,
      data,
      message: "Time to hire fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationTimeToHire = async (req, res, next) => {
  try {
    const data = await analyticsService.getOrganizationTimeToHire(req.user);

    res.status(200).json({
      success: true,
      data,
      message: "Organization time to hire fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};


export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardStats(req.user);

    res.status(200).json({
      success: true,
      data,
      message: "Dashboard stats fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getRecentActivity(req.user, limit);

    res.status(200).json({
      success: true,
      data,
      message: "Recent activity fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidatesByStage = async (req, res, next) => {
  try {
    const data = await analyticsService.getCandidatesByStage(req.user);

    res.status(200).json({
      success: true,
      data,
      message: "Candidates by stage fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};
