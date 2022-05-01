const { ObjectId } = require("mongodb")
const options = { returnOriginal: false }

const handleAddingItems = async (req, res, users) => {
   const { email, productId } = req.body
   let result = null
   let user = await users.findOne({ email })
   if (user.cartItems.some(item => item.productId === productId)) {
      result = await users.findOneAndUpdate(
         { email, "cartItems.productId": productId },
         { $inc: { "cartItems.$.qty": 1 } },
         options
      )
   } else {
      result = await users.findOneAndUpdate(
         { email },
         { $push: { cartItems: { productId, qty: 1 } } },
         options
      )
   }
   const { cartItems } = result.value
   res.json({ result: result.ok, cartItems })
}

const handleRemovingItems = async (req, res, users) => {
   const { email, productId } = req.body
   let result = null
   let user = await users.findOne({ email })
   const product = user.cartItems.find(item => item.productId === productId)
   if (!product) return res.json("Can't Remove Unadded Item")
   if (product.qty === 1) {
      result = await users.findOneAndUpdate(
         { email },
         { $pull: { cartItems: { productId } } },
         options
      )
   } else {
      result = await users.findOneAndUpdate(
         { email, "cartItems.productId": productId },
         { $inc: { "cartItems.$.qty": -1 } },
         options
      )
   }
   const { cartItems } = result.value
   res.json({ result: result.ok, cartItems })
}

const handleClearCart = async (req, res, users) => {
   const { email } = req.body
   const result = await users.findOneAndUpdate(
      { email },
      { $set: { cartItems: [] } },
      options
   )
   const { cartItems } = result.value
   res.json({ result: result.ok, cartItems })
}

// GraphQL
const handleAddingItemsGraphQL = async (args, users, { req }) => {
   const { productId } = args
   const { id } = req
   let result = null
   let user = await users.findOne({ _id: ObjectId(id) })
   if (user.cartItems.some(item => item.productId === productId)) {
      result = await users.findOneAndUpdate(
         { _id: ObjectId(id), "cartItems.productId": productId },
         { $inc: { "cartItems.$.qty": 1 } },
         options
      )
   } else {
      result = await users.findOneAndUpdate(
         { _id: ObjectId(id) },
         { $push: { cartItems: { productId, qty: 1 } } },
         options
      )
   }
   const { cartItems } = result.value
   return { result: result.ok, cartItems }
}

const handleRemovingItemsGraphQL = async (args, users, { req }) => {
   const { productId } = args
   const { id } = req
   let result = null
   let user = await users.findOne({ _id: ObjectId(id) })
   const product = user.cartItems.find(item => item.productId === productId)
   if (!product) return { result: 0 }
   if (product.qty === 1) {
      result = await users.findOneAndUpdate(
         { _id: ObjectId(id) },
         { $pull: { cartItems: { productId } } },
         options
      )
   } else {
      result = await users.findOneAndUpdate(
         { _id: ObjectId(id), "cartItems.productId": productId },
         { $inc: { "cartItems.$.qty": -1 } },
         options
      )
   }
   const { cartItems } = result.value
   return { result: 1, cartItems }
}

const handleClearCartGraphQL = async (users, { req }) => {
   const { id } = req
   const result = await users.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { cartItems: [] } },
      options
   )
   const { cartItems } = result.value
   return { result: result.ok, cartItems }
}
module.exports = {
   handleAddingItems,
   handleRemovingItems,
   handleClearCart,
   handleAddingItemsGraphQL,
   handleRemovingItemsGraphQL,
   handleClearCartGraphQL
}