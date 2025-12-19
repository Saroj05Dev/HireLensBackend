import Organization from "../models/Organization.js";

export const create = async (data, session) => {
  const organization = new Organization(data);
  await organization.save({ session });
  return organization;
};

export const updateOwner = async (orgId, ownerId, session) => {
  return Organization.findByIdAndUpdate(
    orgId,
    { ownerId },
    { session, new: true }
  );
};