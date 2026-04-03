import * as organizationService from '../services/organization.service.js';

export const inviteUser = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const result = await organizationService.inviteUser(req.user, { email, role });

        res.status(201).json({
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
    const members = await organizationService.getMembers(
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

export const getPendingInvites = async (req, res, next) => {
  try {
    const invites = await organizationService.getPendingInvites(
      req.user.organizationId
    );

    res.status(200).json({
      success: true,
      data: invites
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateMember = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await organizationService.deactivateMember(req.user, userId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}