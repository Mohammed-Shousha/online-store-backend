const { ObjectId } = require("mongodb")
const options = { returnOriginal: false }

const handleAddingAddress = async (req, res, users) => {
   const { email, name, address, phone } = req.body
   const result = await users.findOneAndUpdate(
      { email },
      { $push: { addresses: { id: ObjectId(), name, address, phone } } },
      options
   )
   const { ok, value } = result
   const { addresses } = value
   res.json({ result: ok, addresses })
}

const handleDeletingAddress = async (req, res, users) => {
   const { email, addressId } = req.body
   const result = await users.findOneAndUpdate(
      { email },
      { $pull: { addresses: { id: ObjectId(addressId) } } },
      options
   )
   const { ok, value } = result
   const { addresses } = value
   res.json({ result: ok, addresses })
}

const handleUpdatingAddress = async (req, res, users) => {
   const { addressId, name, address, phone } = req.body
   const result = await users.findOneAndUpdate(
      { "addresses.id": ObjectId(addressId) },
      {
         $set:
         {
            "addresses.$.name": name,
            "addresses.$.address": address,
            "addresses.$.phone": phone
         }
      },
      options
   )
   const { ok, value } = result
   const addresses = value
   res.json({ result: ok, addresses })
}

//GraphQL
const handleAddingAddressGraphQL = async (args, users, { req }) => {
   const { name, address, phone } = args
   const { id } = req
   const result = await users.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $push: { addresses: { id: ObjectId(), name, address, phone } } },
      options
   )
   const { ok, value } = result
   const { addresses } = value
   return { result: ok, addresses }
}

const handleDeletingAddressGraphQL = async (args, users, { req }) => {
   const { addressId } = args
   const { id } = req
   const result = await users.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $pull: { addresses: { id: ObjectId(addressId) } } },
      options
   )

   const { ok, value } = result
   const { addresses } = value
   return { result: ok, addresses }
}

const handleUpdatingAddressGraphQL = async (args, users) => {
   const { addressId, name, address, phone } = args
   const result = await users.findOneAndUpdate(
      { "addresses.id": ObjectId(addressId) },
      {
         $set:
         {
            "addresses.$.name": name,
            "addresses.$.address": address,
            "addresses.$.phone": phone
         }
      },
      options
   )
   const { ok, value } = result
   const { addresses } = value
   return { result: ok, addresses }
}

module.exports = {
   handleAddingAddress,
   handleDeletingAddress,
   handleUpdatingAddress,
   handleAddingAddressGraphQL,
   handleDeletingAddressGraphQL,
   handleUpdatingAddressGraphQL,
}