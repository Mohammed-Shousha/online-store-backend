const bcrypt = require('bcrypt')

const handleSignIn = async (req, res, col) => {
    const { email, password } = req.body
    const user = await col.findOne({ email })
    if(user){
        const isValid = await bcrypt.compare(password, user.password.hash)
        if (isValid) {
            res.json(user)
        } else {
            res.status(400).json('Wrong Email or Password')
        }
    }else{
        res.status(400).json('Wrong Email or Password') // email not registered
    }
}

module.exports = handleSignIn