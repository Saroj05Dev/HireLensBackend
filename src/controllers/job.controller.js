import * as jobService from "../services/job.service.js";

export const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.user, req.body);

    res.status(201).json({
      success: true,
      data: job,
      message: "Job created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getOrganizationJobs(req.user.organizationId);

    res.status(200).json({
      success: true,
      data: jobs,
      message: "Jobs retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req, res, next) => {
  try {
    const job = await jobService.closeJob(req.user, req.params.jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job closed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const reopenJob = async (req, res, next) => {
  try {
    const job = await jobService.reopenJob(req.user, req.params.jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job reopened successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.user, req.params.jobId, req.body);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await jobService.deleteJob(req.user, req.params.jobId);

    res.status(200).json({
      success: true,
      data: job,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
