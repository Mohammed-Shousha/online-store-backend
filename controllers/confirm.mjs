import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const { GMAIL_USER, GMAIL_PASS } = process.env;

export const sendConfirmationEmail = async (user) => {
  const { _id, email, name } = user;
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
    subject: "Confirm Your Account", // Subject line
    text: `Hi ${name} Please Confirm Your Account`, // plain text body
    html: `<h1> Hi ${name}, </h1>
        <h1>Thank You for Signing Up in Online-Store</h1>
        <h2>Please Click the Link Below to Redirect You to The Confirmation Page</h2>
        <h2><a href='https://online-store-react-app.herokuapp.com/confirm/${_id}'> Click Here </a></h2>`,
  });
  return info.messageId;
};

export const handleResendEmail = async (req, res, users) => {
  const { email } = req.body;
  const user = await users.findOne({ email });
  const id = await sendConfirmationEmail(user);
  if (id) {
    res.json("Success");
  } else {
    res.json("Failed");
  }
};

export const handleConfirmation = async (req, res, users) => {
  const { id } = req.body;
  const result = await users.updateOne(
    { _id: ObjectId(id) },
    {
      $set: {
        confirmed: true,
      },
    }
  );
  res.json(result);
};

//GraphQL
export const handleResendEmailGraphQL = async (users, { req }) => {
  const { id } = req;
  const user = await users.findOne({ _id: new ObjectId(id) });
  const messageId = await sendConfirmationEmail(user);
  const result = messageId ? 1 : 0;
  return result;
};

export const handleConfirmationGraphQL = async (args, users) => {
  const { id } = args;
  const result = await users.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        confirmed: true,
      },
    }
  );
  return result.result.nModified;
};
