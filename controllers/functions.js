const { sign } = require('jsonwebtoken')
require('dotenv').config()

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

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
   res.cookie('accessToken', accessToken, { httpOnly: true })
   res.cookie('refreshToken', refreshToken, { httpOnly: true })
}


module.exports = {
   createTokens
}