import User from "../models/User.js";

export const findByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export const findById = async (id) => {
  return User.findById(id);
};

export const findByEmailWithPassword = async (email) => {
  const user = await User.findOne({ email }).select("+password");
  return user;
};

export const findByOrganizationId = async (organizationId) => {
  return User.find({ organizationId })
    .select("_id name email role isActive createdAt")
    .sort({ createdAt: -1 });
};

export const create = async (data, session) => {
  const user = new User(data);
  await user.save({ session });
  return user;
};

export const updateById = async (userId, updateData) => {
    return User.findByIdAndUpdate(userId, updateData, { new: true });
};