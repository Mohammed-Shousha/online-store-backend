const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { ApolloServer, gql } = require('apollo-server-express')
const { verify } = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb')
const { handleSignUpGraphQL } = require('./controllers/signup')
const { handleSignInGraphQL } = require('./controllers/signin')
const { handleAddingItemsGraphQL, handleRemovingItemsGraphQL, handleClearCartGraphQL } = require('./controllers/cartItems')
const { handleResendEmailGraphQL, handleConfirmationGraphQL } = require('./controllers/confirm')
const { handleAddingOrderGraphQL, handleRemovingOrderGraphQL, handleClearOrdersGraphQL } = require('./controllers/orders')
const { handleChangeDataGraphQL, handleChangePasswordGraphQL } = require('./controllers/profile')
const { handleAddingAddressGraphQL, handleDeletingAddressGraphQL, handleUpdatingAddressGraphQL } = require('./controllers/shipping')
const { handleForgetPasswordGraphQL, handleResetPasswordGraphQL, handleVerifyToken } = require('./controllers/password')
const { handleGoogleSignInGraphQL } = require('./controllers/google')
const { addProduct, getProducts, getProductById, getProductsByType, getProductsByBrand, getProductsByName } = require('./controllers/products')
const { getUsers, getUserByEmail, getUserById, getUserByToken } = require('./controllers/users')
const { createTokens } = require('./controllers/functions')
const handlePayment = require('./controllers/payment')
const { handleSignOutGraqhql } = require('./controllers/signout')
require('dotenv').config()

const { MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

;
(async () => {
   const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
   const db = client.db('DB')
   const users = db.collection('Users')
   const products = db.collection('Products')

   const typeDefs = gql`
      type Query {
         users: [User]
         user (email: String!): User!
         userById(id: ID!): User!
         userByToken: User!
         products: [Product]
         productById (id: ID!): Product
         productsByType (type: String!): [Product]
         productsByBrand (type: String!, brand: String!): [Product]
         productsByName (name: String!): [Product]
      } 
      
      type User {
        _id: ID!
        name: String!
        email: String!
        password: Password!
        confirmed: Boolean!
        phone: String!
        addresses: [Address!]
        cartItems: [CartItem!]
        orders: [Order!]
      }

      type Password {
        hash: String!
        length: Int!
      }

      type Address {
        id: ID!
        name: String!
        address: String!
        phone: String!
      }

      type CartItem {
        productId: ID!
        qty: Int!
      }

      type Order {
        id: ID!
        order: [CartItem!]!
        time: String!
      }

      union Response = User | Error

      union SignUpResult = Result | Error

      type ForgetPasswordResult {
         result: Int!
         message: String
      }

      type Error {
        message: String!
      }

      type Result {
        user: User!
        emailSent: Boolean!
      }

      type CartResult {
        result: Int! # 1 'Success' or 0 'Failed'
        cartItems: [CartItem!]
      }

      type OrderResult {
        result: Int! # 1 'Success' or 0 'Failed'
        orders: [Order!]
        cartItems: [CartItem!]
      }

      type ChangeDataResult {
        result: Int! # 1 'Success' or 0 'Failed'
        user: User!
      }

      type AddressResult {
        result: Int! # 1 'Success' or 0 'Failed'
        addresses: [Address!]
      }

      type Product {
         _id: ID!
         name: String!
         type: String!
         brand: String
         price: Int!
         photo: String!
         description: String
      }
      
      type Mutation {
         handleSignIn(email: String!, password: String!): Response
         handleGoogleSignIn(token: String!): Response
         handleSignUp(name: String!, email: String!, password: String!, phone: String!, address: String): SignUpResult
         handleSignOut: Int! # 1 'Success' or 0 'Failed'
         handleAddingItems(productId: ID!): CartResult
         handleRemovingItems(productId: ID!): CartResult
         handleClearCart: CartResult
         handleAddingOrder: OrderResult
         handleRemovingOrder(email: String!, orderId: ID!): OrderResult
         handleClearOrders(email: String!): Int # 1 'Success' or 0 'Failed'  
         handleConfirmation(id: ID!): Int! # 1 'Success' or 0 'Failed'  
         handleResendEmail: Int! # 1 'Success' or 0 'Failed'  
         handleForgetPassword(email: String): ForgetPasswordResult!
         handleResetPassword(token: String!, password: String!): Int! # 1 'Success' or 0 'Failed'
         handleVerifyToken(token: String!): Int! # 1 'Success' or 0 'Failed'
         handleChangeData(name:String!, phone: String!): ChangeDataResult
         handleChangePassword(password: String!, newPassword: String!): Response
         handleAddingAddress(name: String!, phone: String!, address: String!): AddressResult
         handleDeletingAddress(addressId: ID!): AddressResult
         handleUpdatingAddress(addressId: ID!, name: String!, phone: String!, address: String!): AddressResult
         addProduct(name: String!, type: String!, brand: String, price: Int!, photo: String!, description: String): Product
      }
   `

   const resolvers = {
      Query: {
         users: (_) => getUsers(users),
         user: (_, args) => getUserByEmail(args, users),
         userById: (_, args) => getUserById(args, users),
         userByToken: (_, __, context) => getUserByToken(users, context),
         products: (_) => getProducts(products),
         productById: (_, args) => getProductById(args, products),
         productsByType: (_, args) => getProductsByType(args, products),
         productsByBrand: (_, args) => getProductsByBrand(args, products),
         productsByName: (_, args) => getProductsByName(args, products)
      },
      Mutation: {
         handleSignIn: (_, args, context) => handleSignInGraphQL(args, users, context),
         handleGoogleSignIn: (_, args, context) => handleGoogleSignInGraphQL(args, users, context),
         handleSignUp: (_, args, context) => handleSignUpGraphQL(args, users, context),
         handleSignOut: (_, __, context) => handleSignOutGraqhql(context),
         handleAddingItems: (_, args, context) => handleAddingItemsGraphQL(args, users, context),
         handleRemovingItems: (_, args, context) => handleRemovingItemsGraphQL(args, users, context),
         handleClearCart: (_, __, context) => handleClearCartGraphQL(users, context),
         handleAddingOrder: (_, __, context) => handleAddingOrderGraphQL(users, products, context),
         handleRemovingOrder: (_, args) => handleRemovingOrderGraphQL(args, users),
         handleClearOrders: (_, args) => handleClearOrdersGraphQL(args, users),
         handleConfirmation: (_, args) => handleConfirmationGraphQL(args, users),
         handleResendEmail: (_, __, context) => handleResendEmailGraphQL(users, context),
         handleForgetPassword: (_, args) => handleForgetPasswordGraphQL(args, users),
         handleResetPassword: (_, args, context) => handleResetPasswordGraphQL(args, users, context),
         handleVerifyToken: (_, args) => handleVerifyToken(args),
         handleChangeData: (_, args, context) => handleChangeDataGraphQL(args, users, context),
         handleChangePassword: (_, args, context) => handleChangePasswordGraphQL(args, users, context),
         handleAddingAddress: (_, args, context) => handleAddingAddressGraphQL(args, users, context),
         handleDeletingAddress: (_, args, context) => handleDeletingAddressGraphQL(args, users, context),
         handleUpdatingAddress: (_, args) => handleUpdatingAddressGraphQL(args, users),
         addProduct: (_, args) => addProduct(args, products)
      },
      Response: {
         __resolveType(obj) {
            if (obj._id) {
               return 'User'
            }

            if (obj.message) {
               return 'Error'
            }

            return null
         }
      },
      SignUpResult: {
         __resolveType(obj) {
            if (obj.user) {
               return 'Result'
            }

            if (obj.message) {
               return 'Error'
            }

            return null
         }
      }
   }

   const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req, res }) => ({ req, res }),
      cors: false
   })

   const app = express()

   app.use(cors({
      credentials: true,
      // origin: "https://online-store-react-app.herokuapp.com",
      origin: "http://localhost:3000",
      origin: "https://online-store-swart.vercel.app",
   }))
   app.use(cookieParser())
   app.use(express.json())
   app.use(async (req, res, next) => {
      const { accessToken, refreshToken } = req.cookies

      if (!refreshToken && !accessToken) {
         return next()
      }

      try {
         const { id } = verify(accessToken, ACCESS_TOKEN_SECRET)
         req.id = id
         return next()
      } catch (error) { }

      if (!refreshToken) {
         return next()
      }

      let data

      try {
         data = verify(refreshToken, REFRESH_TOKEN_SECRET)
      } catch (error) {
         return next()
      }

      const user = await users.findOne({ _id: ObjectId(data.id) })

      if (!user) {
         return next()
      }

      createTokens(user, res)

      req.id = user._id

      next()
   }
   )
   server.applyMiddleware({ app, cors: false })

   app.post('/payment', (req, res) => handlePayment(req, res, users, products))

   const port = process.env.PORT || 4000 
   
   app.listen({ port }, () =>
      console.log(`Now browse to http://localhost:${port}${server.graphqlPath}`)
   )
})()