import ApiError from "../utils/ApiError.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as jobRepository from "../repositories/job.repository.js";

export const addCandidate = async (user, payload) => {
    const { jobId, name, email, phone, resumeUrl } = payload;

    if(!jobId || !name) {
        throw new ApiError(400, "Job id and candidate name are required");
    }

    // 1. Validate job existence within the organization
    const job = await jobRepository.findById(jobId);
    if (!job || job.organizationId.toString() !== user.organizationId) {
        throw new ApiError(404, "Job not found in your organization");
    }

    // 2. Create candidate record
    return candidateRepository.create({
        organizationId: user.organizationId,
        name,
        email,
        phone,
        resumeUrl,
        jobId,
        addedBy: user.id
    });
};