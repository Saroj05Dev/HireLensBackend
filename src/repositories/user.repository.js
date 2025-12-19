import User from "../models/User.js";

export const findByEmail = (email) => {
  return User.findOne({ email });
};

export const create = async (data, session) => {
  const user = new User(data);
  await user.save({ session });
  return user;
};