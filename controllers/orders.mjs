import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { options } from "../database.mjs";

dotenv.config();

const { GMAIL_USER, GMAIL_PASS } = process.env;

const orderTime = () => {
  let date = new Date();
  date = date.toLocaleString("en-GB", {
    hour12: true,
    timeZone: "Africa/Cairo",
    dateStyle: "short",
    timeStyle: "short",
  });
  const dateArr = date.split(",");
  return dateArr[0] + " " + dateArr[1];
};

const productsFromOrder = (order, products) => {
  const newProducts = order.map(async (o) => {
    const product = await products.findOne({ _id: new ObjectId(o.productId) });
    return { product, qty: o.qty };
  });
  return Promise.all(newProducts);
};

const sendOrderConfirmationEmail = async (user, placedOrder, products) => {
  const { email, name } = user;
  const { id, order, time } = placedOrder;

  const newProducts = await productsFromOrder(order, products);

  let textContent = [];
  newProducts.map((product) => {
    let text = `<h4>• ${product.product.name} x${product.qty}</h4>`;
    textContent.push(text);
  });

  const htmlText = textContent.join("</br>");

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });
  let info = await transporter.sendMail({
    from: "Online Store <online.store.project.2020@gmail.com>",
    to: email, // list of receivers
    subject: "Order Confirmation", // Subject line
    text: `Hi ${name}, Your order has been placed`, // plain text body
    html: `
         <h1> Hi ${name}, </h1>
         <h1>Thank You for choosing us</h1>
         <h2>Here is a summary of your order</h2>
         <h3>Order Id: ${id}</h3>
         <h3> Order Time: ${time}</h3>
         <h3> Order Details: </h3>
         ${htmlText}`,
  });
  return info.messageId;
};

export const handleAddingOrder = async (req, res, users, products) => {
  const { email } = req.body;
  let user = await users.findOne({ email });
  const result = await users.findOneAndUpdate(
    { email },
    {
      $push: {
        orders: {
          id: new ObjectId(),
          order: user.cartItems,
          time: orderTime(),
        },
      },
      $set: { cartItems: [] },
    },
    options
  );
  const { orders } = result.value;
  sendOrderConfirmationEmail(
    (user = result.value),
    (lastOrder = orders[orders.length - 1]),
    products
  );
  res.json({ result: result.ok, orders });
};

export const handleRemovingOrder = async (req, res, users) => {
  const { email, orderId } = req.body;
  const result = await users.findOneAndUpdate(
    { email },
    { $pull: { orders: { id: new ObjectId(orderId) } } },
    options
  );
  const { orders } = result.value;
  res.json({ result: result.ok, orders });
};

export const handleClearOrders = async (req, res, users) => {
  const { email } = req.body;
  const result = await users.findOneAndUpdate(
    { email },
    { $set: { orders: [] } },
    options
  );
  res.json({ result: result.ok });
};

//GraphQL
export const handleAddingOrderGraphQL = async (users, products, { req }) => {
  const { id } = req;
  let user = await users.findOne({ _id: new ObjectId(id) });
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $push: {
        orders: {
          id: new ObjectId(),
          order: user.cartItems,
          time: orderTime(),
        },
      },
      $set: { cartItems: [] },
    },
    options
  );
  const { orders, cartItems } = result.value; // user

  sendOrderConfirmationEmail(result.value, orders[orders.length - 1], products);
  return { result: result.ok, orders, cartItems };
};

export const handleRemovingOrderGraphQL = async (args, users) => {
  const { email, orderId } = args;
  const result = await users.findOneAndUpdate(
    { email },
    { $pull: { orders: { id: new ObjectId(orderId) } } },
    options
  );
  const { orders } = result.value;
  return { result: result.ok, orders };
};

export const handleClearOrdersGraphQL = async (args, users) => {
  const { email } = args;
  const result = await users.findOneAndUpdate(
    { email },
    { $set: { orders: [] } },
    options
  );
  return result.ok;
};
