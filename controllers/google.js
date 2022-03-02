const handleGoogleSignIn = async (args, users) => {
   const { email } = args
   const user = await users.findOne({ email })
   if (user) {
      return user
   } else {
      return { message: 'Email Not Registered' }
   }
}

module.exports = {
   handleGoogleSignIn
}