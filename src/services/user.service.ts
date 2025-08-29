import User, { IUser } from "../models/user.model";

export const createUser = async (data: Partial<IUser>): Promise<IUser> => {
  const user = new User(data);
  return await user.save();
};

export const getUsers = async (): Promise<IUser[]> => {
  return await User.find();
};
