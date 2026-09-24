import { User, UserRole, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const findByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

export const findById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const findByEmailWithPassword = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

export const findByOrganizationId = async (
  organizationId: string
): Promise<User[]> => {
  return prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
};

export const create = async (
  data: Prisma.UserUncheckedCreateInput,
  tx?: Prisma.TransactionClient
): Promise<User> => {
  const db = tx || prisma;
  return db.user.create({
    data,
  });
};

export const updateById = async (
  userId: string,
  updateData: Prisma.UserUncheckedUpdateInput,
  tx?: Prisma.TransactionClient
): Promise<User | null> => {
  const db = tx || prisma;
  return db.user.update({
    where: { id: userId },
    data: updateData,
  });
};

export const findByOrganizationAndRole = async (
  organizationId: string,
  role: UserRole
): Promise<User[]> => {
  return prisma.user.findMany({
    where: {
      organizationId,
      role,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });
};

export const updatePassword = async (
  userId: string,
  hashedPassword: string
): Promise<User | null> => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};