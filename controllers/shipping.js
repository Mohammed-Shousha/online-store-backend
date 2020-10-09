const { ObjectId } = require("mongodb")

const handleAddingAddress = async (req, res, col) => {
    const { email, name, address, phone } = req.body
    const result = await col.updateOne(
        { email },
        { $push: { addresses: { id: ObjectId(), name, address, phone } } }
    )
    const user = await col.findOne({ email })
    const newAddresses = user.addresses
    res.json({ result, newAddresses })
}

const handleDeletingAddress = async (req, res, col) => {
    const { email, addressId } = req.body
    const result = await col.updateOne(
        { email },
        { $pull: { addresses: { id: ObjectId(addressId) } } }
    )
    const user = await col.findOne({ email })
    const newAddresses = user.addresses
    res.json({ result, newAddresses })
}

const handleUpdatingAddress = async (req, res, col) => {
    const { addressId, name, address, phone } = req.body
    const result = await col.updateOne(
        { "addresses.id": ObjectId(addressId) },
        { $set:
            {
                "addresses.$.name": name,
                "addresses.$.address": address,
                "addresses.$.phone": phone
            }
        }
    )
    const user = await col.findOne({ "addresses.id": ObjectId(addressId) })
    const newAddresses = user.addresses
    res.json({ result, newAddresses })
}

module.exports = {
    handleAddingAddress,
    handleDeletingAddress,
    handleUpdatingAddress
}