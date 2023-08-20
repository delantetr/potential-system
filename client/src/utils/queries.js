import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;

export const SEARCH_GOOGLE_BOOKS = gql`
  query SearchGoogleBooks($searchInput: String!) {
    searchGoogleBooks(searchInput: $searchInput) {
      items {
        id
        volumeInfo {
          authors
          title
          description
          imageLinks {
            thumbnail
          }
        }
      }
    }
  }
`;
