const { ObjectId } = require("mongodb")
require('dotenv').config()
const nodemailer = require("nodemailer")

const sendEmail = async (user) => {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    })
    let info = await transporter.sendMail({
        from: 'Online Store <online.store.project.2020@gmail.com>',
        to: user.email, // list of receivers
        subject: "Confirm Your Account", // Subject line
        text: `Hi ${user.name} Please Confirm Your Account`, // plain text body
        html: `<h1> Hi ${user.name}, </h1>
        <h1>Thank You for Signing Up in Online-Store</h1>
        <h2>Please Click the Link Below to Redirect You to The Confirmation Page</h2>
        <h2><a href='http://localhost:3000/confirm/${user._id}'> Click Here </a></h2>`,
    })
    return info.messageId
}

const handleResendEmail = async (req, res, users) =>{
    const { email } = req.body
    const user = await users.findOne({ email })
    const id = await sendEmail(user)
    if(id){
        res.json('Success')
    }else{
        res.json('Failed')
    }
}

const handleConfirmation = async (req, res, users) => {
    const result = await users.updateOne(
        { _id: ObjectId(req.params.id) },
        { $set: {
            confirmed: true
        }}
    )
    res.json(result)
}

module.exports = {
    handleConfirmation,
    handleResendEmail,
    sendEmail
}
