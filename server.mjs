import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

import { users, products } from "./database.mjs";

import { handleSignUp } from "./controllers/signup.mjs";
import { handleSignIn } from "./controllers/signin.mjs";
import {
  handleAddingAddress,
  handleDeletingAddress,
  handleUpdatingAddress,
} from "./controllers/shipping.mjs";
import {
  handleChangeData,
  handleChangePassword,
} from "./controllers/profile.mjs";
import {
  handleAddingItems,
  handleRemovingItems,
  handleClearCart,
} from "./controllers/cartItems.mjs";
import {
  handleAddingOrder,
  handleRemovingOrder,
} from "./controllers/orders.mjs";
import { handlePayment } from "./controllers/payment.mjs";
import {
  handleConfirmation,
  handleResendEmail,
} from "./controllers/confirm.mjs";

dotenv.config();
const app = express();

try {
  app.use(express.json());
  app.use(cors());

  app.get("/", async (req, res) => {
    const resultCursor = users.find({});
    const result = await resultCursor.toArray();
    res.json(result);
  });

  app.get("/products", async (req, res) => {
    const resultCursor = products.find({});
    const result = await resultCursor.toArray();
    res.json(result);
  });

  app.post("/signup", (req, res) => handleSignUp(req, res, users));

  app.post("/confirm/:id", (req, res) => handleConfirmation(req, res, users));

  app.post("/resendemail", (req, res) => handleResendEmail(req, res, users));

  app.post("/signin", (req, res) => handleSignIn(req, res, users));

  app.put("/changedata", (req, res) => handleChangeData(req, res, users));

  app.put("/changepassword", (req, res) =>
    handleChangePassword(req, res, users)
  );

  app.put("/addaddress", (req, res) => handleAddingAddress(req, res, users));

  app.put("/updateaddress", (req, res) =>
    handleUpdatingAddress(req, res, users)
  );

  app.delete("/deleteaddress", (req, res) =>
    handleDeletingAddress(req, res, users)
  );

  app.put("/additem", (req, res) => handleAddingItems(req, res, users));

  app.put("/removeitem", (req, res) => handleRemovingItems(req, res, users));

  app.put("/clearcart", (req, res) => handleClearCart(req, res, users));

  app.put("/addorder", (req, res) =>
    handleAddingOrder(req, res, users, products)
  );

  app.put("/removeorder", (req, res) => handleRemovingOrder(req, res, users));

  app.post("/payment", (req, res) => handlePayment(req, res, users, products));

  app.get("/findById/:id", async (req, res) => {
    const user = await users.findOne({ _id: ObjectId(req.params.id) });
    res.json(user);
  });

  app.delete("/delById/:id", async (req, res) => {
    const deletedUser = await users.deleteOne({ _id: ObjectId(req.params.id) });
    res.json(deletedUser);
  });

  app.delete("/delByName/:name", async (req, res) => {
    const deletedUser = await users.deleteMany({ name: req.params.name });
    res.json(deletedUser);
  });

  const port = process.env.PORT || 8888;
  app.listen(port, () => console.log(`listening on port ${port}`));
} catch (err) {
  console.error(err);
}
