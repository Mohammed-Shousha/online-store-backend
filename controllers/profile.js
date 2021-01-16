const bcrypt = require('bcrypt')
const saltRounds = 10

const handleChangeData = async (req, res, users) => {
    const { name, phone, email } = req.body
    const result = await users.updateOne(
        { email },
        { $set: { name, phone } }
        )
    const user = await users.findOne({ email })
    res.json({ result, user })
}

const handleChangePassword = async (req, res, users) => {
    const { email, password, newPassword } = req.body
    const user = await users.findOne({ email })
    const isValid = await bcrypt.compare(password, user.password.hash)
    const hash = await bcrypt.hash(newPassword, saltRounds)
    if (!isValid) {
        return res.status(400).json({ wrongPassword: 'Wrong Password' })
    } else if(password === newPassword) {
        return res.status(400).json({ samePassword: 'You Need to Write a New Password' })
    } else {
        await users.updateOne(
            { email },
            { $set: { password: { hash, length: newPassword.length } } }
        )
        const user = await users.findOne({ email })
        res.json({ user })
    }
}

//GraphQL
const handleChangeDataGraphQL = async (args, users) => {
    const { name, phone, email } = args
    const result = await users.updateOne(
        { email },
        { $set: { name, phone } }
        )
    const user = await users.findOne({ email })
    return { result: result.result.nModified, user }
}

const handleChangePasswordGraphQL = async (args, users) => {
    const { email, password, newPassword } = args
    const user = await users.findOne({ email })
    const isValid = await bcrypt.compare(password, user.password.hash)
    const hash = await bcrypt.hash(newPassword, saltRounds)
    if (!isValid) {
        return { message: 'Wrong Password' }
    } else if(password === newPassword) {
        return { message: 'You Need to Write a New Password' }
    } else {
        await users.updateOne(
            { email },
            { $set: { password: { hash, length: newPassword.length } } }
        )
        const user = await users.findOne({ email })
        return user
    }
}

module.exports = {
    handleChangeData,
    handleChangePassword,
    handleChangeDataGraphQL,
    handleChangePasswordGraphQL
}