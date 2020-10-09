const handleAddingItems = async (req, res, col) => {
    const { email, productId } = req.body
    let result = null
    let user = await col.findOne({ email })
    if (user.cartItems.some(item => item.productId === productId)) {
        result = await col.updateOne(
            { email, "cartItems.productId": productId },
            { $inc: { "cartItems.$.qty": 1 } }
        )
    } else {
        result = await col.updateOne(
            { email },
            { $push: { cartItems: { productId, qty: 1 } } }
        )
    }
    user = await col.findOne({ email })
    const cartItems = user.cartItems
    res.json({ result, cartItems })
}

const handleRemovingItems = async (req, res, col) => {
    const { email, productId } = req.body
    let result = null
    let user = await col.findOne({ email })
    const product = user.cartItems.find(item => item.productId === productId)
    if (!product) return res.json("Can't Remove Unadded Item")
    if (product.qty === 1) {
        result = await col.updateOne(
            { email },
            { $pull: { cartItems: { productId } } }
        )
    } else {
        result = await col.updateOne(
            { email, "cartItems.productId": productId },
            { $inc: { "cartItems.$.qty": -1 } }
        )
    }
    user = await col.findOne({ email })
    const cartItems = user.cartItems
    res.json({ result, cartItems })
}

const handleClearCart = async (req, res, col) => {
    const { email } = req.body
    const result = await col.updateOne(
        { email },
        { $set: { cartItems: []}}
    )
    const user = await col.findOne({ email })
    const cartItems = user.cartItems
    res.json({ result, cartItems })
}

module.exports = {
    handleAddingItems,
    handleRemovingItems,
    handleClearCart
}