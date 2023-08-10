import bcrypt from "bcrypt";
import Verifier from "email-verifier";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

import { createTokens } from "./functions.mjs";
import { sendConfirmationEmail } from "./confirm.mjs";

dotenv.config();
const { EMAIL_VERIFIER_KEY, SALT_ROUNDS } = process.env;

const verifier = new Verifier(EMAIL_VERIFIER_KEY);
const saltRounds = 10;

export const handleSignUp = async (req, res, users) => {
  const { email } = req.body;
  const user = await users.findOne({ email });
  if (user) {
    return res
      .status(400)
      .json({ usedEmail: "This Email Already Have an Account Linked to It" });
  }
  verifier.verify(email, (err, data) => {
    if (err) throw err;
    if (
      data.smtpCheck === "false" ||
      data.dnsCheck === "false" ||
      data.disposableCheck === "true"
    ) {
      return res.status(400).json({ invalidEmail: "Invalid Email" });
    } else {
      addUser(req, res, users);
    }
  });
};

const addUser = async (req, res, users) => {
  const { name, email, password, phone, address } = req.body;
  let addresses = address ? [{ id: new ObjectId(), name, address, phone }] : [];
  const hash = await bcrypt.hash(password, Number(SALT_ROUNDS));

  let newUser = {
    name,
    email,
    confirmed: false,
    password: { hash, length: password.length },
    phone,
    addresses: addresses,
    cartItems: [],
    orders: [],
  };

  await users.insertOne(newUser);
  const user = await users.findOne({ email });
  const messageId = await sendEmail(user);
  if (messageId) {
    res.json({ user, emailSent: "Email Sent" });
  } else {
    res.json({ user });
  }
};

//GraphQL
export const handleSignUpGraphQL = async (args, users, { res }) => {
  const { email } = args;
  const user = await users.findOne({ email });
  if (user)
    return { message: "This Email Already Have an Account Linked to It" };
  const result = addUserGraphQL(args, users, res);
  return result;
};

const addUserGraphQL = async (args, users, res) => {
  const { name, email, password, phone, address } = args;
  let addresses = address ? [{ id: new ObjectId(), name, address, phone }] : [];
  const hash = await bcrypt.hash(password, saltRounds);

  let newUser = {
    name,
    email,
    confirmed: false,
    password: { hash, length: password.length },
    phone,
    addresses: addresses,
    cartItems: [],
    orders: [],
  };

  await users.insertOne(newUser);
  const user = await users.findOne({ email });
  createTokens(user, res);
  const messageId = await sendConfirmationEmail(user);
  if (messageId) {
    return { user, emailSent: true };
  } else {
    return { user, emailSent: false };
  }
};
