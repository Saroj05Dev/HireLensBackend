import { Organization, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const create = async (
  data: Prisma.OrganizationCreateInput,
  tx?: Prisma.TransactionClient
): Promise<Organization> => {
  const db = tx || prisma;
  return db.organization.create({
    data,
  });
};

export const updateOwner = async (
  orgId: string,
  ownerId: string,
  tx?: Prisma.TransactionClient
): Promise<Organization | null> => {
  const db = tx || prisma;
  return db.organization.update({
    where: { id: orgId },
    data: { ownerId },
  });
};

export const findById = async (
  orgId: string,
  tx?: Prisma.TransactionClient
): Promise<Organization | null> => {
  const db = tx || prisma;
  return db.organization.findUnique({
    where: { id: orgId },
  });
};