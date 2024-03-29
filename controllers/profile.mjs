import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

import { options } from "../database.mjs";

dotenv.config();

const { SALT_ROUNDS } = process.env;

export const handleChangeData = async (req, res, users) => {
  const { name, phone, email } = req.body;
  const result = await users.findOneAndUpdate(
    { email },
    { $set: { name, phone } },
    options
  );
  const { ok, value } = result;
  res.json({ result: ok, user: value });
};

export const handleChangePassword = async (req, res, users) => {
  const { email, password, newPassword } = req.body;
  const user = await users.findOne({ email });
  const isValid = await bcrypt.compare(password, user.password.hash);
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  if (!isValid) {
    return res.status(400).json({ message: "Wrong Password" });
  } else if (password === newPassword) {
    return res
      .status(400)
      .json({ message: "You Need to Write a New Password" });
  } else {
    const result = await users.findOneAndUpdate(
      { email },
      { $set: { password: { hash, length: newPassword.length } } },
      options
    );
    res.json({ user: result.value });
  }
};

//GraphQL
export const handleChangeDataGraphQL = async (args, users, { req }) => {
  const { name, phone } = args;
  const { id } = req;
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { name, phone } },
    options
  );
  const { ok, value } = result;
  return { result: ok, user: value };
};

export const handleChangePasswordGraphQL = async (args, users, { req }) => {
  const { password, newPassword } = args;
  const { id } = req;
  const user = await users.findOne({ _id: new ObjectId(id) });
  const isValid = await bcrypt.compare(password, user.password.hash);
  if (!isValid) {
    return { message: "Wrong Password" };
  } else if (password === newPassword) {
    return { message: "You Need to Write a New Password" };
  } else {
    const hash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { password: { hash, length: newPassword.length } } },
      options
    );
    return result.value; //user
  }
};
