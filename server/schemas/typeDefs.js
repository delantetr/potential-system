const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type bookSchema {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type User {
    _id: ID!
  username: String!
  email: String!
  password: String!
  savedBooks: [bookSchema]
  }

  input BookInput {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users(_id: String): [User]
  }

  type Mutation {
  addUser(username: String!, email: String!, password: String!): Auth
  login(email: String!, password: String!): Auth
  saveBook(book: BookInput!): User
  removeBook(bookId: String!): User
}
`;

module.exports = typeDefs;
