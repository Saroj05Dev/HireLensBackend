import { Request, Response, NextFunction } from "express";
import * as organizationService from "../services/organization.service.js";

const getParam = (param: string | string[] | undefined): string => {
  return Array.isArray(param) ? param[0] : param || "";
};

export const inviteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    const result = await organizationService.inviteUser(req.user as any, { email, role });

    res.status(201).json({
      success: true,
      data: result,
      message: "User invited successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await organizationService.acceptInvite(req.body);

    res.status(200).json({
      success: true,
      data: result,
      message: "Invitation accepted. Account activated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const members = await organizationService.getMembers(req.user.organizationId);

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingInvites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const invites = await organizationService.getPendingInvites(req.user.organizationId);

    res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getParam(req.params.userId);
    const result = await organizationService.deactivateMember(req.user as any, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};