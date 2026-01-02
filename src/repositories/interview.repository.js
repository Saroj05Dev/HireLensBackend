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
    return Interview.find({ candidateId: candidateId })
      .populate('interviewerId', 'name email')
      .populate('jobId', 'title')
      .populate('candidateId', 'name email');
}
