import Candidate from "../models/Candidate.js";

export const create = async (data) => {
    const candidate = new Candidate(data);
    await candidate.save();
    return candidate;
}

export const findByJobId = async (jobId) => {
  return Candidate.find({ jobId }).sort({ createdAt: -1 });
};

export const findById = async (candidateId) => {
  return Candidate.findById(candidateId);
};
