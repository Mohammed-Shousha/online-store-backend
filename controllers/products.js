const { ObjectId } = require('mongodb')

const addProduct = async (args, products) => {
   const { name, type, brand, price, photo, description } = args

   let newProduct = {
      name,
      type,
      brand,
      price,
      photo,
      description
   }

   await products.insertOne(newProduct)
   const product = products.findOne({ name })
   return product
}

const getProducts = async (products) => {
   const resultCursor = products.find({})
   const result = await resultCursor.toArray()
   return result
}

const getProductById = async (args, products) => {
   const product = await products.findOne({ _id: ObjectId(args.id) })
   return product
}

const getProductsByType = async (args, products) => {
   const { type } = args
   const resultCursor = products.find({ type })
   const result = await resultCursor.toArray()
   return result
}

const getProductsByBrand = async (args, products) => {
   const { type, brand } = args
   const resultCursor = products.find({ type, brand })
   const result = await resultCursor.toArray()
   return result
}

const getProductsByName = async (args, products) => {
   const resultCursor = products.find({ name: { $regex: `.*${args.name}.*`, $options: "i" } })
   const result = await resultCursor.toArray()
   return result
}

module.exports = { 
   addProduct,
   getProducts,
   getProductById,
   getProductsByType,
   getProductsByBrand,
   getProductsByName
}