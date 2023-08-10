import { users, products } from "./database.mjs";

import { handleSignUpGraphQL } from "./controllers/signup.mjs";
import { handleSignInGraphQL } from "./controllers/signin.mjs";
import { handleGoogleSignInGraphQL } from "./controllers/google.mjs";
import { handleSignOutGraqhql } from "./controllers/signout.mjs";

import {
  handleAddingItemsGraphQL,
  handleRemovingItemsGraphQL,
  handleClearCartGraphQL,
} from "./controllers/cartItems.mjs";

import {
  handleResendEmailGraphQL,
  handleConfirmationGraphQL,
} from "./controllers/confirm.mjs";

import {
  handleAddingOrderGraphQL,
  handleRemovingOrderGraphQL,
  handleClearOrdersGraphQL,
} from "./controllers/orders.mjs";

import {
  handleChangeDataGraphQL,
  handleChangePasswordGraphQL,
} from "./controllers/profile.mjs";

import {
  handleAddingAddressGraphQL,
  handleDeletingAddressGraphQL,
  handleUpdatingAddressGraphQL,
} from "./controllers/shipping.mjs";

import {
  handleForgetPasswordGraphQL,
  handleResetPasswordGraphQL,
  handleVerifyToken,
} from "./controllers/password.mjs";

import {
  addProduct,
  getProducts,
  getProductById,
  getProductsByType,
  getProductsByBrand,
  getProductsByName,
} from "./controllers/products.mjs";
import {
  getUsers,
  getUserByEmail,
  getUserById,
  getUserByToken,
} from "./controllers/users.mjs";

export const typeDefs = `#graphql
  type Query {
    users: [User]
    user(email: String!): User!
    userById(id: ID!): User!
    userByToken: User!
    products: [Product]
    productById(id: ID!): Product
    productsByType(type: String!): [Product]
    productsByBrand(type: String!, brand: String!): [Product]
    productsByName(name: String!): [Product]
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
    handleSignUp(
      name: String!
      email: String!
      password: String!
      phone: String!
      address: String
    ): SignUpResult
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
    handleChangeData(name: String!, phone: String!): ChangeDataResult
    handleChangePassword(password: String!, newPassword: String!): Response
    handleAddingAddress(
      name: String!
      phone: String!
      address: String!
    ): AddressResult
    handleDeletingAddress(addressId: ID!): AddressResult
    handleUpdatingAddress(
      addressId: ID!
      name: String!
      phone: String!
      address: String!
    ): AddressResult
    addProduct(
      name: String!
      type: String!
      brand: String
      price: Int!
      photo: String!
      description: String
    ): Product
  }
`;

export const resolvers = {
  Query: {
    users: (_) => getUsers(users),
    user: (_, args) => getUserByEmail(args, users),
    userById: (_, args) => getUserById(args, users),
    userByToken: (_, __, context) => getUserByToken(users, context),
    products: (_) => getProducts(products),
    productById: (_, args) => getProductById(args, products),
    productsByType: (_, args) => getProductsByType(args, products),
    productsByBrand: (_, args) => getProductsByBrand(args, products),
    productsByName: (_, args) => getProductsByName(args, products),
  },
  Mutation: {
    handleSignIn: (_, args, context) =>
      handleSignInGraphQL(args, users, context),
    handleGoogleSignIn: (_, args, context) =>
      handleGoogleSignInGraphQL(args, users, context),
    handleSignUp: (_, args, context) =>
      handleSignUpGraphQL(args, users, context),
    handleSignOut: (_, __, context) => handleSignOutGraqhql(context),
    handleAddingItems: (_, args, context) =>
      handleAddingItemsGraphQL(args, users, context),
    handleRemovingItems: (_, args, context) =>
      handleRemovingItemsGraphQL(args, users, context),
    handleClearCart: (_, __, context) => handleClearCartGraphQL(users, context),
    handleAddingOrder: (_, __, context) =>
      handleAddingOrderGraphQL(users, products, context),
    handleRemovingOrder: (_, args) => handleRemovingOrderGraphQL(args, users),
    handleClearOrders: (_, args) => handleClearOrdersGraphQL(args, users),
    handleConfirmation: (_, args) => handleConfirmationGraphQL(args, users),
    handleResendEmail: (_, __, context) =>
      handleResendEmailGraphQL(users, context),
    handleForgetPassword: (_, args) => handleForgetPasswordGraphQL(args, users),
    handleResetPassword: (_, args, context) =>
      handleResetPasswordGraphQL(args, users, context),
    handleVerifyToken: (_, args) => handleVerifyToken(args),
    handleChangeData: (_, args, context) =>
      handleChangeDataGraphQL(args, users, context),
    handleChangePassword: (_, args, context) =>
      handleChangePasswordGraphQL(args, users, context),
    handleAddingAddress: (_, args, context) =>
      handleAddingAddressGraphQL(args, users, context),
    handleDeletingAddress: (_, args, context) =>
      handleDeletingAddressGraphQL(args, users, context),
    handleUpdatingAddress: (_, args) =>
      handleUpdatingAddressGraphQL(args, users),
    addProduct: (_, args) => addProduct(args, products),
  },
  Response: {
    __resolveType(obj) {
      if (obj._id) {
        return "User";
      }

      if (obj.message) {
        return "Error";
      }

      return null;
    },
  },
  SignUpResult: {
    __resolveType(obj) {
      if (obj.user) {
        return "Result";
      }

      if (obj.message) {
        return "Error";
      }

      return null;
    },
  },
};
