const nodemailer = require("nodemailer")
const { sign, verify } = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const { ObjectId } = require("mongodb")
require('dotenv').config()

const { GMAIL_USER, GMAIL_PASS, FORGET_PASSWORD_SECRET, SALT_ROUNDS } = process.env


const sendForgetPasswordEmail = async (user, token) => {
   const { name, email } = user
   let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
         user: GMAIL_USER,
         pass: GMAIL_PASS
      }
   })
   let info = await transporter.sendMail({
      from: 'Online Store <online.store.project.2020@gmail.com>',
      to: email, // list of receivers
      subject: "Reset Your Password", // Subject line
      text: `Hi ${name}, follow the instructions to reset your password`, // plain text body
      html: `<h1> Hi ${name}, </h1>
        <h2>Please Click the Link Below to reset your password</h2>
        <h3><a href='http://localhost:3000/resetpassword/${token}'> Click Here </a></h3>
        <p> This Link will be expired in 15 minutes </p>`,
   })
   return info.messageId
}

const handleForgetPassword = async (req, res, users) => {
   const { email } = req.body
   const user = await users.findOne({ email })
   const token = sign(
      { id: user._id },
      FORGET_PASSWORD_SECRET,
      { expiresIn: '15m' }
   )
   const id = await sendForgetPasswordEmail(user, token)
   if (id) {
      res.json('Success')
   } else {
      res.json('Failed')
   }
}

const handleResetPassword = async (req, res, users) => {
   const { token, password } = req.body
   const hash = await bcrypt.hash(password, Number(SALT_ROUNDS))
   const { id } = verify(token, FORGET_PASSWORD_SECRET)
   const result = await users.updateOne(
      { _id: ObjectId(id) },
      { $set: { password: { hash, length: password.length } } }
   )
   if (result.result.nModified) {
      res.json('Success')
   }
}

//GraphQL
const handleForgetPasswordGraphQL = async (args, users) => {
   const { email } = args
   const user = await users.findOne({ email })
   if (!user) {
      return { result: 0, message: "There is no account with that email" }
   }
   const token = sign(
      { id: user._id },
      FORGET_PASSWORD_SECRET,
      { expiresIn: '15m' }
   )
   const id = await sendForgetPasswordEmail(user, token)
   const result = id ? { result: 1 } : { result: 0 }
   return result
}

const handleResetPasswordGraphQL = async (args, users) => {
   const { token, password } = args
   const { id } = verify(token, FORGET_PASSWORD_SECRET)
   const hash = await bcrypt.hash(password, Number(SALT_ROUNDS))
   const result = await users.updateOne(
      { _id: ObjectId(id) },
      { $set: { password: { hash, length: password.length } } }
   )
   return result.result.nModified
}

const handleVerifyToken = (args) => {
   const { token } = args
   try {
      const { id } = verify(token, FORGET_PASSWORD_SECRET)
      const result = id ? 1 : 0 
      return result
   } catch (error) {
      return 0
   }
}
 
module.exports = {
   handleForgetPassword,
   handleResetPassword,
   handleForgetPasswordGraphQL,
   handleResetPasswordGraphQL,
   handleVerifyToken
}