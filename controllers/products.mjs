import { ObjectId } from "mongodb";

export const addProduct = async (args, products) => {
  const { name, type, brand, price, photo, description } = args;

  let newProduct = {
    name,
    type,
    brand,
    price,
    photo,
    description,
  };

  await products.insertOne(newProduct);
  const product = products.findOne({ name });
  return product;
};

export const getProducts = async (products) => {
  const resultCursor = products.find({});
  const result = await resultCursor.toArray();
  return result;
};

export const getProductById = async (args, products) => {
  const product = await products.findOne({ _id: new ObjectId(args.id) });
  return product;
};

export const getProductsByType = async (args, products) => {
  const { type } = args;
  const resultCursor = products.find({ type });
  const result = await resultCursor.toArray();
  return result;
};

export const getProductsByBrand = async (args, products) => {
  const { type, brand } = args;
  const resultCursor = products.find({ type, brand });
  const result = await resultCursor.toArray();
  return result;
};

export const getProductsByName = async (args, products) => {
  const resultCursor = products.find({
    name: { $regex: `.*${args.name}.*`, $options: "i" },
  });
  const result = await resultCursor.toArray();
  return result;
};
