import * as organizationService from '../services/organization.service.js';

export const inviteUser = async (req, res, next) => {
    try {
        const result = await organizationService.inviteUser(req.user, req.body);

        res.status(200).json({
            success: true,
            data: result,
            message: 'User invited successfully'
        });
    } catch (error) {
        next(error);
    }
}