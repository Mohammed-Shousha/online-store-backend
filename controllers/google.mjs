import { createTokens } from "./functions.mjs";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();
const { GOOGLE_CLIENT_ID } = process.env;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const handleGoogleSignIn = async (req, res, users) => {
  const { token } = req.body;
  const { email } = await client.getTokenInfo(token); // get email from userInfo
  const user = await users.findOne({ email });
  if (user) {
    res.json(user);
  } else {
    res.status(400).json("Email Not Registered");
  }
};

//GraphQL
export const handleGoogleSignInGraphQL = async (args, users, { res }) => {
  const { token } = args;
  const { email } = await client.getTokenInfo(token); // get email from userInfo
  const user = await users.findOne({ email });
  if (user) {
    createTokens(user, res);
    return user;
  } else {
    return { message: "Email Not Registered" };
  }
};
