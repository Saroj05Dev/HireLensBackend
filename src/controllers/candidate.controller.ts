import { Request, Response, NextFunction } from "express";
import * as candidateService from "../services/candidate.service.js";

const getParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || "";
};

export const addCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await candidateService.addCandidate(
      req.user as any,
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      data: candidate,
      message: "Candidate added successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const parseResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = await candidateService.parseResumeProfile(req.file);

    res.status(200).json({
      success: true,
      data: parsed,
      message: "Resume parsed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidatesByJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = getParam(req.params.jobId);
    const candidate = await candidateService.getCandidatesByJob(
      req.user as any,
      jobId
    );

    res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await candidateService.getAllCandidates(
      req.user as any,
      req.query as any
    );

    res.status(200).json({
      success: true,
      data: candidates,
      message: "Candidates fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getParam(req.params.candidateId);
    const candidate = await candidateService.getCandidateProfile(
      req.user as any,
      candidateId
    );

    res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate profile fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getParam(req.params.candidateId);
    const result = await candidateService.updateCandidateStage(
      req.user as any,
      candidateId,
      req.body
    );

    res.json({
      success: true,
      data: result,
      message: "Candidate stage updated",
    });
  } catch (error) {
    next(error);
  }
};

export const reopenCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getParam(req.params.candidateId);
    const result = await candidateService.reopenCandidate(
      req.user as any,
      candidateId,
      req.body
    );

    res.json({
      success: true,
      data: result,
      message: "Candidate reopened successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateDecisionLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getParam(req.params.candidateId);
    const logs = await candidateService.getCandidateDecisionLogs(
      req.user as any,
      candidateId
    );

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewsByCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getParam(req.params.candidateId);
    const interviews = await candidateService.getInterviewsByCandidate(
      req.user as any,
      candidateId
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