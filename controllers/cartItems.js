const handleAddingItems = async (req, res, users) => {
    const { email, productId } = req.body
    let result = null
    let user = await users.findOne({ email })
    if (user.cartItems.some(item => item.productId === productId)) {
        result = await users.updateOne(
            { email, "cartItems.productId": productId },
            { $inc: { "cartItems.$.qty": 1 } }
        )
    } else {
        result = await users.updateOne(
            { email },
            { $push: { cartItems: { productId, qty: 1 } } }
        )
    }
    user = await users.findOne({ email })
    const cartItems = user.cartItems
    res.json({result, cartItems })
}

const handleRemovingItems = async (req, res, users) => {
    const { email, productId } = req.body
    let result = null
    let user = await users.findOne({ email })
    const product = user.cartItems.find(item => item.productId === productId)
    if (!product) return res.json("Can't Remove Unadded Item")
    if (product.qty === 1) {
        result = await users.updateOne(
            { email },
            { $pull: { cartItems: { productId } } }
        )
    } else {
        result = await users.updateOne(
            { email, "cartItems.productId": productId },
            { $inc: { "cartItems.$.qty": -1 } }
        )
    }
    user = await users.findOne({ email })
    const cartItems = user.cartItems
    res.json({ result, cartItems })
}

const handleClearCart = async (req, res, users) => {
    const { email } = req.body
    const result = await users.updateOne(
        { email },
        { $set: { cartItems: []}}
    )
    const user = await users.findOne({ email })
    const cartItems = user.cartItems
    res.json({ result, cartItems })
}

// GraphQL
const handleAddingItemsGraphQL = async (args, users) => {
    const { email, productId } = args
    let result = null
    let user = await users.findOne({ email })
    if (user.cartItems.some(item => item.productId === productId)) {
        result = await users.updateOne(
            { email, "cartItems.productId": productId },
            { $inc: { "cartItems.$.qty": 1 } }
        )
    } else {
        result = await users.updateOne(
            { email },
            { $push: { cartItems: { productId, qty: 1 } } }
        )
    }
    user = await users.findOne({ email })
    const cartItems = user.cartItems
    return { result: result.result.nModified, cartItems }
}

const handleRemovingItemsGraphQL = async (args, users) => {
    const { email, productId } = args
    let result = null
    let user = await users.findOne({ email })
    const product = user.cartItems.find(item => item.productId === productId)
    if (!product) return {message: "Can't Remove Unadded Item"}
    if (product.qty === 1) {
        result = await users.updateOne(
            { email },
            { $pull: { cartItems: { productId } } }
        )
    } else {
        result = await users.updateOne(
            { email, "cartItems.productId": productId },
            { $inc: { "cartItems.$.qty": -1 } }
        )
    }
    user = await users.findOne({ email })
    const cartItems = user.cartItems
    return { result: result.result.nModified, cartItems }
}

const handleClearCartGraphQL = async (args, users) => {
    const { email } = args
    const result = await users.updateOne(
        { email },
        { $set: { cartItems: [] } }
    )
    const user = await users.findOne({ email })
    const cartItems = user.cartItems
    return { result: result.result.nModified, cartItems }
}
module.exports = {
    handleAddingItems,
    handleRemovingItems,
    handleClearCart,
    handleAddingItemsGraphQL,
    handleRemovingItemsGraphQL,
    handleClearCartGraphQL
}