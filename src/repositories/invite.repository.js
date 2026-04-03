import Invite from "../models/Invite.js";

/**
 * Create new invitation record
 * @param {Object} data - Invitation data (email, role, organizationId, token, expiresAt)
 * @returns {Promise<Invite>} Created invitation
 */
export const create = async (data) => {
  const invite = new Invite(data);
  await invite.save();
  return invite;
};

/**
 * Find invitation by token
 * @param {string} token - Invitation token (UUID)
 * @returns {Promise<Invite|null>} Invitation or null if not found
 */
export const findByToken = async (token) => {
  return Invite.findOne({ token });
};

/**
 * Find pending invitations for organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Invite[]>} Array of pending invitations
 */
export const findPendingByOrganization = async (organizationId) => {
  return Invite.find({ 
    organizationId, 
    isAccepted: false 
  })
    .select("email role token createdAt expiresAt")
    .sort({ createdAt: -1 });
};

/**
 * Mark invitation as accepted
 * @param {string} inviteId - Invitation ID
 * @returns {Promise<Invite>} Updated invitation
 */
export const markAccepted = async (inviteId) => {
  return Invite.findByIdAndUpdate(
    inviteId,
    { isAccepted: true },
    { new: true }
  );
};

/**
 * Check for duplicate pending invites by email and organization
 * @param {string} email - Invitee email address
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Invite|null>} Pending invitation or null if not found
 */
export const findPendingByEmailAndOrg = async (email, organizationId) => {
  return Invite.findOne({ 
    email: email.toLowerCase(), 
    organizationId, 
    isAccepted: false 
  });
};
