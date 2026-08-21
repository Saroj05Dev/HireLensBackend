import { Request, Response, NextFunction } from "express";
import * as analyticsService from "../services/analytics.service.js";

const getParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || "";
};

export const getCandidateTimeInStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getParam(req.params.candidateId);
    const data = await analyticsService.getCandidateTimeInStage(
      req.user as any,
      candidateId
    );

    res.status(200).json({
      success: true,
      data,
      message: "Candidate time in stage fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getJobFunnel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const data = await analyticsService.getJobFunnel(
      req.user as any,
      jobId
    );

    res.status(200).json({
      success: true,
      data,
      message: "Job funnel fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPipelineSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getPipelineSummary(req.user as any);

    res.status(200).json({
      success: true,
      data,
      message: "Pipeline summary fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getTimeToHire = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const data = await analyticsService.getTimeToHire(
      req.user as any,
      jobId
    );

    res.status(200).json({
      success: true,
      data,
      message: "Time to hire fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationTimeToHire = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getOrganizationTimeToHire(req.user as any);

    res.status(200).json({
      success: true,
      data,
      message: "Organization time to hire fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getDashboardStats(req.user as any);

    res.status(200).json({
      success: true,
      data,
      message: "Dashboard stats fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await analyticsService.getRecentActivity(req.user as any, limit);

    res.status(200).json({
      success: true,
      data,
      message: "Recent activity fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidatesByStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getCandidatesByStage(req.user as any);

    res.status(200).json({
      success: true,
      data,
      message: "Candidates by stage fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};