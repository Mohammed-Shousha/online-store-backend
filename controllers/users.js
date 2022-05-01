const { ObjectId } = require('mongodb')

const getUsers = async (users) => {
   const resultCursor = users.find({})
   const result = await resultCursor.toArray()
   return result
}

const getUserByEmail = async (args, users) => {
   const { email } = args
   const user = await users.findOne({ email })
   return user
}

const getUserById = async (args, users) => {
   const { id } = args
   const user = await users.findOne({ _id: ObjectId(id) })
   return user
}

const getUserByToken = async (users, { req }) => {
   const { id } = req
   const user = await users.findOne({ _id: ObjectId(id) })
   return user
}

module.exports = {
   getUsers,
   getUserByEmail,
   getUserById,
   getUserByToken
}