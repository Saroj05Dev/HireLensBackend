import * as candidateService from '../services/candidate.service.js';

export const addCandidate = async (req, res, next) => {
    try {
        const candidate = await candidateService.addCandidate(req.user, req.body);

        res.status(201).json({
            success: true,
            data: candidate,
            message: 'Candidate added successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const getCandidatesByJob = async (req, res, next) => {
    try {
        const candidate = await candidateService.getCandidatesByJob(req.user, req.params.jobId);

        res.status(200).json({
            success: true,
            data: candidate,
            message: 'Candidate fetched successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const getAllCandidates = async (req, res, next) => {
    try {
        const candidates = await candidateService.getAllCandidates(req.user, req.query);

        res.status(200).json({
            success: true,
            data: candidates,
            message: 'Candidates fetched successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const getCandidateProfile = async (req, res, next) => {
    try {
        const candidate = await candidateService.getCandidateProfile(req.user, req.params.candidateId);

        res.status(200).json({
            success: true,
            data: candidate,
            message: 'Candidate profile fetched successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const updateCandidateStage = async (req, res, next) => {
  try {
    const result = await candidateService.updateCandidateStage(
      req.user,
      req.params.candidateId,
      req.body
    );

    res.json({
      success: true,
      data: result,
      message: "Candidate stage updated"
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateDecisionLogs = async (req, res, next) => {
  try {
    const logs = await candidateService.getCandidateDecisionLogs(
      req.user,
      req.params.candidateId
    );

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewsByCandidate = async (req, res, next) => {
  try {
    const interviews = await candidateService.getInterviewsByCandidate(
      req.user,
      req.params.candidateId
    );

    res.status(200).json({
      success: true,
      data: interviews,
      message: "Interviews fetched successfully"
    });
  } catch (error) {
    next(error);
  }
}