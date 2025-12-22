import Candidate from "../models/Candidate.js";

export const create = async (data) => {
    const candidate = new Candidate(data);
    await candidate.save();
    return candidate;
}