import Interview from "../models/Interview.js";

export const create = async (data) => {
    const interview = new Interview(data);
    await interview.save();
    return interview;
}

export const findById = async (interviewId) => {
    return Interview.findById(interviewId);
}

export const findByCandidateId = async (candidateId) => {
    return Interview.find({ candidateId })
      .populate('interviewerId', 'name email')
      .populate('jobId', 'title')
      .populate('candidateId', 'name email');
}

export const findByInterviewerId = async (interviewerId) => {
    return Interview.find({ interviewerId })
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .sort({ scheduledAt: 1 });
}

export const findByJobId = async (jobId) => {
    return Interview.find({ jobId })
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name email')
      .sort({ scheduledAt: 1 });
}

export const findByOrganization = async (organizationId, filters = {}) => {
    const query = { organizationId };
    if (filters.status) query.status = filters.status;
    if (filters.jobId) query.jobId = filters.jobId;
    if (filters.candidateId) query.candidateId = filters.candidateId;

    return Interview.find(query)
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name email')
      .populate('jobId', 'title')
      .sort({ scheduledAt: 1 });
}

