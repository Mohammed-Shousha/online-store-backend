const { sign } = require('jsonwebtoken')
require('dotenv').config()

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

const token_options = {
   sameSite: "none",
   secure: true,
   httpOnly: true,
   maxAge: 7*24*60*60*1000 // 7 days
}

const createTokens = (user, res) => {
   const accessToken = sign(
      { id: user._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15min' }
   )
   const refreshToken = sign(
      { id: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
   )
   res.cookie('accessToken', accessToken, token_options)
   res.cookie('refreshToken', refreshToken, token_options)
}


module.exports = {
   createTokens
}