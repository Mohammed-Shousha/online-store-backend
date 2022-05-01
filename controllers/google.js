const handleGoogleSignIn = async (req, res, users) => {
   const { email } = req.body
   const user = await users.findOne({ email })
   if (user) {
      res.json(user)
   } else {
      res.status(400).json('Email Not Registered')
   }
}

//GraphQL
const handleGoogleSignInGraphQL = async (args, users) => {
   const { email } = args
   const user = await users.findOne({ email })
   if (user) {
      return user
   } else {
      return { message: 'Email Not Registered' }
   }
}

module.exports = {
   handleGoogleSignIn,
   handleGoogleSignInGraphQL
}