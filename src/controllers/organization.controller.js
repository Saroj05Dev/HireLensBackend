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

export const acceptInvite = async (req, res, next) => {
    try {
        const result = await organizationService.acceptInvite(req.body);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Invitation accepted. Account activated successfully.'
        });
    } catch (error) {
        next(error);
    }
}

export const getOrganizationMembers = async (req, res, next) => {
  try {
    const members = await organizationService.getOrganizationMembers(
      req.user.organizationId
    );

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateMember = async (req, res, next) => {
    try {
        const { orgId, userId } = req.params;
        await organizationService.deactivateMember(orgId, userId);

        res.status(200).json({
            success: true,
            message: 'Member deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
}