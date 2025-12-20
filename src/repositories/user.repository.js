import User from "../models/User.js";

export const findByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export const findByEmailWithPassword = async (email) => {
  const user = await User.findOne({ email }).select("+password");
  return user;
};

export const create = async (data, session) => {
  const user = new User(data);
  await user.save({ session });
  return user;
};