const { ObjectId } = require("mongodb")

const orderTime = () => {
    let date = new Date()
    let today = date.getDate() + '/'
        + (date.getMonth() + 1) + '/'
        + date.getFullYear()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12
    minutes = minutes < 10 ? '0' + minutes : minutes
    let now = hours + ':' + minutes + ' ' + ampm
    return today + ' ' + now
}

const handleAddingOrder = async (req, res, users) => {
    const { email } = req.body
    let user = await users.findOne({ email })
    const result = await users.updateOne(
        { email },
        { $push: { orders: { id: ObjectId(), order: user.cartItems, time: orderTime() } } }
    )
    user = await users.findOne({ email })
    const orders =  user.orders
    res.json({ result, orders })
}


const handleRemovingOrder = async (req, res, users) => {
    const { email, orderId } = req.body
    const result = await users.updateOne(
        { email },
        { $pull: { orders: { id: ObjectId(orderId) } } }
    )
    const user = await users.findOne({ email })
    const orders =  user.orders
    res.json({ result, orders })
}

//GraphQL
const handleAddingOrderGraphQL = async (args, users) => {
    const { email } = args
    let user = await users.findOne({ email })
    const result = await users.updateOne(
        { email },
        { $push: { orders: { id: ObjectId(), order: user.cartItems, time: orderTime() } } }
    )
    user = await users.findOne({ email })
    const orders =  user.orders
    return { result: result.result.nModified, orders }
}

const handleRemovingOrderGraphQL = async (args, users) => {
    const { email, orderId } = args
    const result = await users.updateOne(
        { email },
        { $pull: { orders: { id: ObjectId(orderId) } } }
    )
    const user = await users.findOne({ email })
    const orders =  user.orders
    return { result: result.result.nModified, orders }
}

module.exports = {
    handleAddingOrder,
    handleRemovingOrder,
    handleAddingOrderGraphQL,
    handleRemovingOrderGraphQL
}