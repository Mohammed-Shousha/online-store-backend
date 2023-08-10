import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI } = process.env;

const client = await MongoClient.connect(MONGO_URI, {
  useUnifiedTopology: true,
});

if (!client) {
  throw new Error("Failed to connect to MongoDB");
}

console.log("Connected to MongoDB");

const db = client.db("DB");
export const users = db.collection("Users");
export const products = db.collection("Products");

export const options = {
  returnDocument: "after",
};
