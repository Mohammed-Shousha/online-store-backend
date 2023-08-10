import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import stripe from "stripe";

dotenv.config();
const stripeInstance = stripe(process.env.STRIPE_KEY);

export const handlePayment = async (req, res, users, products) => {
  const { email } = req.body;

  const user = await users.findOne({ email });
  let prices = [];
  const items = user.cartItems;
  for (let i = 0; i < items.length; i++) {
    let { productId, qty } = items[i];
    const product = await products.findOne({ _id: new ObjectId(productId) });
    prices.push(product.price * qty);
  }
  let amount = prices.reduce((t, price) => t + price, 0) * 100;
  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: amount,
    currency: "egp",
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};
