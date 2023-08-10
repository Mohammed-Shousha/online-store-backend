import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./schema.mjs";
import { createTokens } from "./controllers/functions.mjs";
import { handlePayment } from "./controllers/payment.mjs";
import { products, users } from "./database.mjs";

const { verify } = jwt;

dotenv.config();
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

const app = express();

app.use(cookieParser());

app.use(async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!refreshToken && !accessToken) {
    return next();
  }

  try {
    const { id } = verify(accessToken, ACCESS_TOKEN_SECRET);
    req.id = id;
    return next();
  } catch (error) {}

  if (!refreshToken) {
    return next();
  }

  let data;

  try {
    data = verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return next();
  }

  const user = await users.findOne({ _id: new ObjectId(data.id) });

  if (!user) {
    return next();
  }

  createTokens(user, res);

  req.id = user._id;

  next();
});

app.use(
  cors({
    credentials: true,
    origin: ["https://online-store-swart.vercel.app", "http://localhost:3000"],
  })
);

app.use(bodyParser.json());

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: ({ req, res }) => ({ req, res }),
  })
);

app.post("/payment", (req, res) => handlePayment(req, res, users, products));

const port = process.env.PORT || 4000;

app.listen({ port }, () =>
  console.log(`Now browse to http://localhost:${port}/graphql`)
);
