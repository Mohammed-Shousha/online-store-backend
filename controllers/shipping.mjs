import { ObjectId } from "mongodb";
import { options } from "../database.mjs";

export const handleAddingAddress = async (req, res, users) => {
  const { email, name, address, phone } = req.body;
  const result = await users.findOneAndUpdate(
    { email },
    { $push: { addresses: { id: new ObjectId(), name, address, phone } } },
    options
  );
  const { ok, value } = result;
  const { addresses } = value;
  res.json({ result: ok, addresses });
};

export const handleDeletingAddress = async (req, res, users) => {
  const { email, addressId } = req.body;
  const result = await users.findOneAndUpdate(
    { email },
    { $pull: { addresses: { id: new ObjectId(addressId) } } },
    options
  );
  const { ok, value } = result;
  const { addresses } = value;
  res.json({ result: ok, addresses });
};

export const handleUpdatingAddress = async (req, res, users) => {
  const { addressId, name, address, phone } = req.body;
  const result = await users.findOneAndUpdate(
    { "addresses.id": new ObjectId(addressId) },
    {
      $set: {
        "addresses.$.name": name,
        "addresses.$.address": address,
        "addresses.$.phone": phone,
      },
    },
    options
  );
  const { ok, value } = result;
  const addresses = value;
  res.json({ result: ok, addresses });
};

//GraphQL
export const handleAddingAddressGraphQL = async (args, users, { req }) => {
  const { name, address, phone } = args;
  const { id } = req;
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $push: { addresses: { id: new ObjectId(), name, address, phone } } },
    options
  );
  const { ok, value } = result;
  const { addresses } = value;
  return { result: ok, addresses };
};

export const handleDeletingAddressGraphQL = async (args, users, { req }) => {
  const { addressId } = args;
  const { id } = req;
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $pull: { addresses: { id: new ObjectId(addressId) } } },
    options
  );
  const { ok, value } = result;
  const { addresses } = value;
  return { result: ok, addresses };
};

export const handleUpdatingAddressGraphQL = async (args, users) => {
  const { addressId, name, phone, address } = args;
  const result = await users.findOneAndUpdate(
    { "addresses.id": new ObjectId(addressId) },
    {
      $set: {
        "addresses.$.name": name,
        "addresses.$.address": address,
        "addresses.$.phone": phone,
      },
    },
    options
  );
  const { ok, value } = result;
  const { addresses } = value;
  return { result: ok, addresses };
};
