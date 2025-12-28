import * as interviewService from "../services/interview.service.js";

export const assignInterviewer = async (req, res, next) => {
    try {
        const interview = await interviewService.assignInterviewer(
            req.user,
            req.body
        );

        res.status(201).json({
            success: true,
            data: interview,
            message: "Interview assigned successfully",
        });
    } catch (error) {
        next(error)
    }
}