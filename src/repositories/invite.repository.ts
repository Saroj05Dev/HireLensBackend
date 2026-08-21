import { Types } from "mongoose";
import Invite, { IInvite, IInviteDocument } from "../models/Invite.js";

/**
 * Create new invitation record
 */
export const create = async (data: Partial<IInvite>): Promise<IInviteDocument> => {
  const invite = new Invite(data);
  await invite.save();
  return invite;
};

/**
 * Find invitation by token
 */
export const findByToken = async (token: string): Promise<IInviteDocument | null> => {
  return Invite.findOne({ token });
};

/**
 * Find pending invitations for organization
 */
export const findPendingByOrganization = async (
  organizationId: string | Types.ObjectId
): Promise<IInviteDocument[]> => {
  return Invite.find({
    organizationId,
    isAccepted: false,
  })
    .select("email role token createdAt expiresAt")
    .sort({ createdAt: -1 });
};

/**
 * Mark invitation as accepted
 */
export const markAccepted = async (
  inviteId: string | Types.ObjectId
): Promise<IInviteDocument | null> => {
  return Invite.findByIdAndUpdate(
    inviteId,
    { isAccepted: true },
    { new: true }
  );
};

/**
 * Check for duplicate pending invites by email and organization
 */
export const findPendingByEmailAndOrg = async (
  email: string,
  organizationId: string | Types.ObjectId
): Promise<IInviteDocument | null> => {
  return Invite.findOne({
    email: email.toLowerCase(),
    organizationId,
    isAccepted: false,
  });
};