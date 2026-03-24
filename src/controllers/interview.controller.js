import * as interviewService from "../services/interview.service.js";

export const assignInterviewer = async (req, res, next) => {
    try {
        const interview = await interviewService.assignInterviewer(
            req.user,
            req.body
        );

        res.status(201).json({
            success: true,
            data: interview,
            message: "Interview assigned successfully",
        });
    } catch (error) {
        next(error)
    }
}

export const submitFeedback = async (req, res, next) => {
  try {
    const feedback = await interviewService.submitFeedback(
      req.user,
      req.params.interviewId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: feedback,
      message: "Feedback submitted"
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getMyInterviews(req.user);

    res.status(200).json({
      success: true,
      data: interviews,
      message: "Interviews fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewsByJob = async (req, res, next) => {
  try {
    const interviews = await interviewService.getInterviewsByJob(
      req.user,
      req.params.jobId
    );

    res.status(200).json({
      success: true,
      data: interviews,
      message: "Interviews fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewFeedback = async (req, res, next) => {
  try {
    const feedback = await interviewService.getInterviewFeedback(
      req.user,
      req.params.interviewId
    );

    res.status(200).json({
      success: true,
      data: feedback,
      message: "Feedback fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewers = async (req, res, next) => {
  try {
    const interviewers = await interviewService.getInterviewers(req.user);

    res.status(200).json({
      success: true,
      data: interviewers,
      message: "Interviewers fetched successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInterviews = async (req, res, next) => {
  try {
    const { status, jobId, candidateId } = req.query;
    const interviews = await interviewService.getAllInterviews(req.user, {
      status,
      jobId,
      candidateId,
    });

    res.status(200).json({
      success: true,
      data: interviews,
      message: "Interviews fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
