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

const handleAddingOrder = async (req, res, col) => {
    const { email } = req.body
    let user = await col.findOne({ email })
    const result = await col.updateOne(
        { email },
        { $push: { orders: { id: ObjectId(), order: user.cartItems, time: orderTime() } } }
    )
    user = await col.findOne({ email })
    const orders =  user.orders
    res.json({ result, orders })
}

const handleRemovingOrder = async (req, res, col) => {
    const { email, orderId } = req.body
    const result = await col.updateOne(
        { email },
        { $pull: { orders: { id: ObjectId(orderId) } } }
    )
    const user = await col.findOne({ email })
    const orders =  user.orders
    res.json({ result, orders })
}

module.exports = {
    handleAddingOrder,
    handleRemovingOrder
}