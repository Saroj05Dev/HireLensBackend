import ApiError from "../utils/ApiError.js";
import * as interviewRepository from "../repositories/interview.repository.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as userRepository from "../repositories/user.repository.js";

export const assignInterviewer = async (
    user,
    { candidateId, interviewerId, scheduledAt }
) => {
    const candidate = await candidateRepository.findById(candidateId);

    if(
        !candidate ||
        candidate.organizationId.toString() !== user.organizationId
    ) {
        throw new ApiError(404, "Candidate not found in your organization");
    }

    const interviewer = await userRepository.findById(interviewerId);


    if(
        !interviewer ||
        interviewer.organizationId.toString() !== user.organizationId ||
        interviewer.role !== "INTERVIEWER"
    ) {
        throw new ApiError(400, "Invalid interviewer");
    }

    return interviewRepository.create({
        organizationId: user.organizationId,
        candidateId,
        jobId: candidate.jobId,
        interviewerId,
        scheduledAt
    });
};