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