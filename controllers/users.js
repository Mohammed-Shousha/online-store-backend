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
   const user = await users.findOne({ _id: ObjectId(args.id) })
   return user
}

module.exports = {
   getUsers,
   getUserByEmail,
   getUserById
}