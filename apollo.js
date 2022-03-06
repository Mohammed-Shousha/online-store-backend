const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { ApolloServer, gql } = require('apollo-server-express')
const { MongoClient, ObjectId } = require('mongodb')
const { handleSignUpGraphQL } = require('./controllers/signup')
const { handleSignInGraphQL } = require('./controllers/signin')
const { handleAddingItemsGraphQL, handleRemovingItemsGraphQL, handleClearCartGraphQL } = require('./controllers/cartItems')
const { handleResendEmailGraphQL, handleConfirmationGraphQL } = require('./controllers/confirm')
const { handleAddingOrderGraphQL, handleRemovingOrderGraphQL } = require('./controllers/orders')
const { handleChangeDataGraphQL, handleChangePasswordGraphQL } = require('./controllers/profile')
const { handleAddingAddressGraphQL, handleDeletingAddressGraphQL, handleUpdatingAddressGraphQL } = require('./controllers/shipping')
const { handleGoogleSignIn } = require('./controllers/google')
const { addProduct, getProducts, getProductById, getProductsByType, getProductsByBrand, getProductsByName } = require('./controllers/products')
const { getUsers, getUserByEmail, getUserById } = require('./controllers/users')
const handlePayment = require('./controllers/payment')

   ;
(async () => {
   const client = await MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
   const db = client.db('DB')
   const users = db.collection('Users')
   const products = db.collection('Products')

   const typeDefs = gql`
      type Query {
         users: [User]
         user (email: String!): User!
         userById( id: ID!): User!
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
        handleSignUp(name: String!, email: String!, password: String!, phone: String!, address: String): SignUpResult
        handleSignIn(email: String!, password: String!): Response
        handleGoogleSignIn(email:String!): Response
        handleAddingItems(email: String!, productId: ID!): CartResult
        handleRemovingItems(email: String!, productId: ID!): CartResult
        handleClearCart(email: String!): CartResult
        handleAddingOrder(email: String!): OrderResult
        handleRemovingOrder(email: String!, orderId: ID!): OrderResult
        handleConfirmation(id: ID!): Int! # 1 'Success' or 0 'Failed'  
        handleResendEmail(email: String!): String! # Success or Failed
        handleChangeData(email: String!, name:String!, phone: String!): ChangeDataResult
        handleChangePassword(email: String!, password: String!, newPassword: String!): Response
        handleAddingAddress(name: String!, email: String!, phone: String!, address: String!): AddressResult
        handleDeletingAddress(email: String!, addressId: ID!): AddressResult
        handleUpdatingAddress(addressId: ID!, name: String, phone: String, address: String): AddressResult
        addProduct(name: String!, type: String!, brand: String, price: Int!, photo: String!, description: String ): Product
      }
   `

   const resolvers = {
      Query: {
         users: (_) => getUsers(users),
         user: (_, args) => getUserByEmail(args, users),
         userById: (_, args) => getUserById(args, users),
         products: (_) => getProducts(products),
         productById: (_, args) => getProductById(args, products),
         productsByType: (_, args) => getProductsByType(args, products),
         productsByBrand: (_, args) => getProductsByBrand(args, products),
         productsByName: (_, args) => getProductsByName(args, products)
      },
      Mutation: {
         handleSignUp: (_, args) => handleSignUpGraphQL(args, users),
         handleSignIn: (_, args, context) => handleSignInGraphQL(args, users, context),
         handleGoogleSignIn: (_, args) => handleGoogleSignIn(args, users),
         handleAddingItems: (_, args) => handleAddingItemsGraphQL(args, users),
         handleRemovingItems: (_, args) => handleRemovingItemsGraphQL(args, users),
         handleClearCart: (_, args) => handleClearCartGraphQL(args, users),
         handleAddingOrder: (_, args) => handleAddingOrderGraphQL(args, users),
         handleRemovingOrder: (_, args) => handleRemovingOrderGraphQL(args, users),
         handleConfirmation: (_, args) => handleConfirmationGraphQL(args, users),
         handleResendEmail: (_, args) => handleResendEmailGraphQL(args, users),
         handleChangeData: (_, args) => handleChangeDataGraphQL(args, users),
         handleChangePassword: (_, args) => handleChangePasswordGraphQL(args, users),
         handleAddingAddress: (_, args) => handleAddingAddressGraphQL(args, users),
         handleDeletingAddress: (_, args) => handleDeletingAddressGraphQL(args, users),
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

   //     const context = ({ req }) => {
   //   const token = req.headers.authorization || ''

   //   try {
   //     return { id, email } = jwt.verify(token.split(' ')[1], SECRET_KEY)
   //   } catch (e) {
   //     throw new AuthenticationError(
   //       'Authentication token is invalid, please log in',
   //     )
   //   }
   // }

   const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req, res }) => ({ req, res })
   })

   app.use(cors({
      credentials: true,
      origin: "http://localhost:3000"
   }))
   app.use(cookieParser())
   app.use(express.json())
   server.applyMiddleware({ app, cors: false })

   app.post('/payment', (req, res) => handlePayment(req, res, users, products))

   app.listen({ port: 4000 }, () =>
      console.log('Now browse to http://localhost:4000' + server.graphqlPath)
   )
})()