const { ObjectId } = require("mongodb")

const handleAddingAddress = async (req, res, users) => {
    const { email, name, address, phone } = req.body
    const result = await users.updateOne(
        { email },
        { $push: { addresses: { id: ObjectId(), name, address, phone } } }
    )
    const user = await users.findOne({ email })
    const newAddresses = user.addresses
    res.json({ result, newAddresses })
}

const handleDeletingAddress = async (req, res, users) => {
    const { email, addressId } = req.body
    const result = await users.updateOne(
        { email },
        { $pull: { addresses: { id: ObjectId(addressId) } } }
    )
    const user = await users.findOne({ email })
    const newAddresses = user.addresses
    res.json({ result, newAddresses })
}

const handleUpdatingAddress = async (req, res, users) => {
    const { addressId, name, address, phone } = req.body
    const result = await users.updateOne(
        { "addresses.id": ObjectId(addressId) },
        { $set:
            {
                "addresses.$.name": name,
                "addresses.$.address": address,
                "addresses.$.phone": phone
            }
        }
    )
    const user = await users.findOne({ "addresses.id": ObjectId(addressId) })
    const newAddresses = user.addresses
    res.json({ result, newAddresses })
}

//GraphQL
const handleAddingAddressGraphQL = async (args, users) => {
    const { email, name, address, phone } = args
    const result = await users.updateOne(
        { email },
        { $push: { addresses: { id: ObjectId(), name, address, phone } } }
    )
    const user = await users.findOne({ email })
    const addresses = user.addresses
    return {result: result.result.nModified, addresses}
}

const handleDeletingAddressGraphQL = async (args, users) => {
    const { email, addressId } = args
    const result = await users.updateOne(
        { email },
        { $pull: { addresses: { id: ObjectId(addressId) } } }
    )
    const user = await users.findOne({ email })
    const addresses = user.addresses
    return {result: result.result.nModified, addresses}
}

const handleUpdatingAddressGraphQL= async (args, users) => {
    const { addressId, name, address, phone } = args
    const result = await users.updateOne(
        { "addresses.id": ObjectId(addressId) },
        { $set:
            {
                "addresses.$.name": name,
                "addresses.$.address": address,
                "addresses.$.phone": phone
            }
        }
    )
    const user = await users.findOne({ "addresses.id": ObjectId(addressId) })
    const addresses = user.addresses
    return {result: result.result.nModified, addresses}
}

module.exports = {
    handleAddingAddress,
    handleDeletingAddress,
    handleUpdatingAddress,
    handleAddingAddressGraphQL,
    handleDeletingAddressGraphQL,
    handleUpdatingAddressGraphQL,

}