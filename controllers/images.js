const handleUploadingImage = async (req, res, products) => {
    const { id, filename } = req.file 
    const { productId } = req.body
    const result = await products.updateOne(
        { productId },
        { $push: { photo: { id, filename } } }
    )
    const product = await products.findOne({ id })
    res.json({ product, result })
    res.json('S')
}

module.exports = handleUploadingImage