import { ObjectId } from "mongodb";

export const getUsers = async (users) => {
  const resultCursor = users.find({});
  const result = await resultCursor.toArray();
  return result;
};

export const getUserByEmail = async (args, users) => {
  const { email } = args;
  const user = await users.findOne({ email });
  return user;
};

export const getUserById = async (args, users) => {
  const { id } = args;
  const user = await users.findOne({ _id: new ObjectId(id) });
  return user;
};

export const getUserByToken = async (users, { req }) => {
  const { id } = req;
  const user = await users.findOne({ _id: new ObjectId(id) });
  return user;
};
