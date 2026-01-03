import Candidate from "../models/Candidate.js";

export const create = async (data) => {
    const candidate = new Candidate(data);
    await candidate.save();
    return candidate;
}

export const findByJobId = async (jobId) => {
  return Candidate.find({ jobId }).sort({ createdAt: -1 });
};

export const findByOrganizationIdWithFilters = async (organizationId, filters) => {
  const query = { organizationId };

  if (filters.stage) {
    query.currentStage = filters.stage;
  }

  if (filters.jobId) {
    query.jobId = filters.jobId;
  }

  return Candidate.find(query)
    .sort({ createdAt: -1 });
};

export const findById = async (candidateId, session) => {
  const query = Candidate.findById(candidateId);

  // attach session only if provided
  if (session) {
    query.session(session);
  }

  return query;
};
