import { Invite, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/**
 * Create new invitation record
 */
export const create = async (
  data: Prisma.InviteUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<Invite> => {
  const db = tx || prisma;
  return db.invite.create({
    data,
  });
};

/**
 * Find invitation by token
 */
export const findByToken = async (token: string): Promise<Invite | null> => {
  return prisma.invite.findUnique({
    where: { token },
  });
};

/**
 * Find pending invitations for organization
 */
export const findPendingByOrganization = async (
  organizationId: string
): Promise<Invite[]> => {
  return prisma.invite.findMany({
    where: {
      organizationId,
      isAccepted: false,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Mark invitation as accepted
 */
export const markAccepted = async (
  inviteId: string,
  tx?: Prisma.TransactionClient
): Promise<Invite | null> => {
  const db = tx || prisma;
  return db.invite.update({
    where: { id: inviteId },
    data: { isAccepted: true },
  });
};

/**
 * Check for duplicate pending invites by email and organization
 */
export const findPendingByEmailAndOrg = async (
  email: string,
  organizationId: string
): Promise<Invite | null> => {
  return prisma.invite.findFirst({
    where: {
      email: email.toLowerCase(),
      organizationId,
      isAccepted: false,
    },
  });
};