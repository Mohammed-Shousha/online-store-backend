const bcrypt = require('bcrypt')
const { createTokens } = require('./functions')
require('dotenv').config()

const handleSignIn = async (req, res, users) => {
   const { email, password } = req.body
   const user = await users.findOne({ email })
   if (user) {
      const isValid = await bcrypt.compare(password, user.password.hash)
      if (isValid) {
         res.json(user)
      } else {
         res.status(400).json('Wrong Email or Password')
      }
   } else {
      res.status(400).json('Email Not Registered')
   }
}

//GraphQL
const handleSignInGraphQL = async (args, users, { res }) => {
   const { email, password } = args
   const user = await users.findOne({ email })
   if (user) {
      const isValid = await bcrypt.compare(password, user.password.hash)
      if (isValid) {
         createTokens(user, res)
         return user
      } else {
         return { message: 'Wrong Email or Password' }
      }
   } else {
      return { message: 'Email Not Registered' }
   }
}

module.exports = { 
   handleSignIn,
   handleSignInGraphQL
}