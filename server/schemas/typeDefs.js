const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    authors: [String]
    description: String
    bookId: String
    image: String
    link: String
    title: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]
  }

  type VolumeInfo {
    authors: [String]
    title: String
    description: String
    imageLinks: ImageLinks
  }
  
  type ImageLinks {
    thumbnail: String
  }
  
  type Book {
    id: String
    volumeInfo: VolumeInfo
  }
  
  type GoogleBooksResponse {
    items: [Book]
  }

  type Auth {
    token: String!
    user: User
  }

  type Query {
    me: User
    searchGoogleBooks(searchInput: String!): GoogleBooksResponse

  }



  type Mutation {
    login(email: String!, password: String!): Auth
    createUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    deleteBook(bookId: String!): User
  }

  input BookInput {
    authors: [String]
    description: String
    bookId: String!
    image: String
    link: String
    title: String
  }
`;

module.exports = typeDefs;
