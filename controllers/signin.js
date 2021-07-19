const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET = 'supersecret'


const handleSignIn = async (req, res, users) => {
    const { email, password } = req.body
    const user = await users.findOne({ email })
    if(user){
        const isValid = await bcrypt.compare(password, user.password.hash)
        if (isValid) {
            res.json(user)
        } else {
            res.status(400).json('Wrong Email or Password')
        }
    }else{
        res.status(400).json('Email Not Registered')
    }
}

//GraphQL
const handleSignInGraphQL = async (args, users, { res }) => {
    const { email, password } = args
    const user = await users.findOne({ email })
    if(user){
        const isValid = await bcrypt.compare(password, user.password.hash)
        if (isValid) {
            const token = jwt.sign({userId: user._id}, SECRET, {expiresIn: '1hr'})
            res.cookie('token', token, { httpOnly: false })
            console.log(token)
            return user
        } else {
            return { message: 'Wrong Email or Password' }
        }
    }else{
        return { message: 'Email Not Registered' }
    }
}

module.exports = { handleSignIn, handleSignInGraphQL }