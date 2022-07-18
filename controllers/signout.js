const token_options = {
   sameSite: "none",
   secure: true,
   httpOnly: true
}

const handleSignOut = (req, res) => {
   res.clearCookie('refreshToken')
   res.clearCookie('accessToken')
}

// GraphQL
const handleSignOutGraqhql = ({ res }) => {
   res.clearCookie('refreshToken', token_options)
   res.clearCookie('accessToken', token_options)
   return 1
}

module.exports = {
   handleSignOut,
   handleSignOutGraqhql
}