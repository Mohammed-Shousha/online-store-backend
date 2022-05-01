const { ObjectId } = require("mongodb")
const options = { returnOriginal: false }

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
   const result = await users.findOneAndUpdate(
      { email },
      {
         $push: { orders: { id: ObjectId(), order: user.cartItems, time: orderTime() } },
         $set: { cartItems: [] }
      },
      options
   )
   const { orders } = result.value
   res.json({ result: result.ok, orders })
}

const handleRemovingOrder = async (req, res, users) => {
   const { email, orderId } = req.body
   const result = await users.findOneAndUpdate(
      { email },
      { $pull: { orders: { id: ObjectId(orderId) } } },
      options
   )
   const { orders } = result.value
   res.json({ result: result.ok, orders })
}

const handleClearOrders = async (req, res, users) => {
   const { email } = req.body
   const result = await users.findOneAndUpdate(
      { email },
      { $set: { orders: [] } },
      options
   )
   res.json({ result: result.ok })
}

//GraphQL
const handleAddingOrderGraphQL = async (users, { req }) => {
   const { id } = req
   let user = await users.findOne({ _id: ObjectId(id) })
   const result = await users.findOneAndUpdate(
      { _id: ObjectId(id) },
      {
         $push: { orders: { id: ObjectId(), order: user.cartItems, time: orderTime() } },
         $set: { cartItems: [] }
      },
      options
   )
   const { orders, cartItems } = result.value
   return { result: result.ok, orders, cartItems }
}

const handleRemovingOrderGraphQL = async (args, users) => {
   const { email, orderId } = args
   const result = await users.findOneAndUpdate(
      { email },
      { $pull: { orders: { id: ObjectId(orderId) } } },
      options
   )
   const { orders } = result.value
   return { result: result.ok, orders }
}

const handleClearOrdersGraphQL = async (args, users) => {
   const { email } = args
   const result = await users.findOneAndUpdate(
      { email },
      { $set: { orders: [] } },
      options
   )
   return result.ok
}

module.exports = {
   handleAddingOrder,
   handleRemovingOrder,
   handleClearOrders,
   handleAddingOrderGraphQL,
   handleRemovingOrderGraphQL,
   handleClearOrdersGraphQL
}