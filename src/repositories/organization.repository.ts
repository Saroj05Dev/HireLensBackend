import { ClientSession, Types } from "mongoose";
import Organization, { IOrganization, IOrganizationDocument } from "../models/Organization.js";

export const create = async (
  data: Partial<IOrganization>,
  session?: ClientSession
): Promise<IOrganizationDocument> => {
  const organization = new Organization(data);
  await organization.save({ session });
  return organization;
};

export const updateOwner = async (
  orgId: string | Types.ObjectId,
  ownerId: string | Types.ObjectId,
  session?: ClientSession
): Promise<IOrganizationDocument | null> => {
  return Organization.findByIdAndUpdate(
    orgId,
    { ownerId },
    { session, new: true }
  );
};

export const findById = async (
  orgId: string | Types.ObjectId
): Promise<IOrganizationDocument | null> => {
  return Organization.findById(orgId);
};