import Interview from "../models/Interview.js";

export const create = async (data) => {
    const interview = new Interview(data);
    await interview.save();
    return interview;
}