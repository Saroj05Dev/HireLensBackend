import { Request, Response, NextFunction } from "express";
import * as jobService from "../services/job.service.js";

const getParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || "";
};

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.createJob(req.user as any, req.body);

    res.status(201).json({
      success: true,
      data: job,
      message: "Job created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const jobs = await jobService.getOrganizationJobs(req.user.organizationId);
    console.log('Jobs being returned to frontend:', JSON.stringify(jobs, null, 2));

    res.status(200).json({
      success: true,
      data: jobs,
      message: "Jobs retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const job = await jobService.closeJob(req.user as any, jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job closed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const reopenJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const job = await jobService.reopenJob(req.user as any, jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job reopened successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const job = await jobService.getJobById(jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const job = await jobService.updateJob(req.user as any, jobId, req.body);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const job = await jobService.deleteJob(req.user as any, jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};