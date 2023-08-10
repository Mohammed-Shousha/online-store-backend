import { ObjectId } from "mongodb";
import { options } from "../database.mjs";

export const handleAddingItems = async (req, res, users) => {
  const { email, productId } = req.body;
  let result = null;
  let user = await users.findOne({ email });
  if (user.cartItems.some((item) => item.productId === productId)) {
    result = await users.findOneAndUpdate(
      { email, "cartItems.productId": productId },
      { $inc: { "cartItems.$.qty": 1 } },
      options
    );
  } else {
    result = await users.findOneAndUpdate(
      { email },
      { $push: { cartItems: { productId, qty: 1 } } },
      options
    );
  }
  const { cartItems } = result.value;
  res.json({ result: result.ok, cartItems });
};

export const handleRemovingItems = async (req, res, users) => {
  const { email, productId } = req.body;
  let result = null;
  let user = await users.findOne({ email });
  const product = user.cartItems.find((item) => item.productId === productId);
  if (!product) return res.json("Can't Remove Unadded Item");
  if (product.qty === 1) {
    result = await users.findOneAndUpdate(
      { email },
      { $pull: { cartItems: { productId } } },
      options
    );
  } else {
    result = await users.findOneAndUpdate(
      { email, "cartItems.productId": productId },
      { $inc: { "cartItems.$.qty": -1 } },
      options
    );
  }
  const { cartItems } = result.value;
  res.json({ result: result.ok, cartItems });
};

export const handleClearCart = async (req, res, users) => {
  const { email } = req.body;
  const result = await users.findOneAndUpdate(
    { email },
    { $set: { cartItems: [] } },
    options
  );
  const { cartItems } = result.value;
  res.json({ result: result.ok, cartItems });
};

// GraphQL
export const handleAddingItemsGraphQL = async (
  { productId },
  users,
  { req: { id } }
) => {
  let result;

  let user = await users.findOne({ _id: new ObjectId(id) });

  if (!user) throw new Error("User not found");

  if (user.cartItems.some((item) => item.productId === productId)) {
    result = await users.findOneAndUpdate(
      { _id: new ObjectId(id), "cartItems.productId": productId },
      { $inc: { "cartItems.$.qty": 1 } },
      options
    );
  } else {
    result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $push: { cartItems: { productId, qty: 1 } } },
      options
    );
  }
  const { cartItems } = result.value;
  return { result: result.ok, cartItems };
};

export const handleRemovingItemsGraphQL = async (args, users, { req }) => {
  const { productId } = args;
  const { id } = req;
  let result = null;
  let user = await users.findOne({ _id: new ObjectId(id) });
  const product = user.cartItems.find((item) => item.productId === productId);
  if (!product) return { result: 0 };
  if (product.qty === 1) {
    result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $pull: { cartItems: { productId } } },
      options
    );
  } else {
    result = await users.findOneAndUpdate(
      { _id: new ObjectId(id), "cartItems.productId": productId },
      { $inc: { "cartItems.$.qty": -1 } },
      options
    );
  }
  const { cartItems } = result.value;
  return { result: 1, cartItems };
};

export const handleClearCartGraphQL = async (users, { req }) => {
  const { id } = req;
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { cartItems: [] } },
    options
  );
  const { cartItems } = result.value;
  return { result: result.ok, cartItems };
};
