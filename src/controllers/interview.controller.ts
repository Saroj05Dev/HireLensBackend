import { Request, Response, NextFunction } from "express";
import * as interviewService from "../services/interview.service.js";

const getParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || "";
};

export const assignInterviewer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await interviewService.assignInterviewer(
      req.user as any,
      req.body
    );

    res.status(201).json({
      success: true,
      data: interview,
      message: "Interview assigned successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interviewId = getParam(req.params.interviewId);
    const feedback = await interviewService.submitFeedback(
      req.user as any,
      interviewId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: feedback,
      message: "Feedback submitted",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interviews = await interviewService.getMyInterviews(req.user as any);

    res.status(200).json({
      success: true,
      data: interviews,
      message: "Interviews fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewsByJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const interviews = await interviewService.getInterviewsByJob(
      req.user as any,
      jobId
    );

    res.status(200).json({
      success: true,
      data: interviews,
      message: "Interviews fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interviewId = getParam(req.params.interviewId);
    const feedback = await interviewService.getInterviewFeedback(
      req.user as any,
      interviewId
    );

    res.status(200).json({
      success: true,
      data: feedback,
      message: "Feedback fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interviewers = await interviewService.getInterviewers(req.user as any);

    res.status(200).json({
      success: true,
      data: interviewers,
      message: "Interviewers fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, jobId, candidateId } = req.query;
    const interviews = await interviewService.getAllInterviews(req.user as any, {
      status: status as any,
      jobId: jobId as string,
      candidateId: candidateId as string,
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