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