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