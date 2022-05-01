const handleSignOut = (req, res) => {
   res.clearCookie('refreshToken')
   res.clearCookie('accessToken')
}

// GraphQL
const handleSignOutGraqhql = ({ res }) => {
   res.clearCookie('refreshToken')
   res.clearCookie('accessToken')
   return 1
}

module.exports = {
   handleSignOut,
   handleSignOutGraqhql
}