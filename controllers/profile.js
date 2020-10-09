const bcrypt = require('bcrypt')
const saltRounds = 10

const handleChangeData = async (req, res, col) => {
    const { name, phone, email } = req.body
    const result = await col.updateOne(
        { email },
        { $set: { name, phone } }
        )
    const user = await col.findOne({ email })
    res.json({ result, user })
}

const handleChangePassword = async (req, res, col) => {
    const { email, password, newPassword } = req.body
    const user = await col.findOne({ email })
    const isValid = await bcrypt.compare(password, user.password.hash)
    const hash = await bcrypt.hash(newPassword, saltRounds)
    if (!isValid) {
        return res.status(400).json({ wrongPassword: 'Wrong Password' })
    } else if(password === newPassword) {
        return res.status(400).json({ samePassword: 'You Need to Write a New Password' })
    } else {
        await col.updateOne(
            { email },
            { $set: { password: { hash, length: newPassword.length } } }
        )
        const user = await col.findOne({ email })
        res.json({ user })
    }
}

module.exports = {
    handleChangeData,
    handleChangePassword
}