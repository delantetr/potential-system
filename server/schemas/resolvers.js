const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const axios = require('axios');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).populate('savedBooks');
        console.log('contextuserid:', context.user._id);
        return userData;
      }
      
      throw new AuthenticationError('Not logged in');
    },
    searchGoogleBooks: async (parent, { searchInput }) => {
      try {
        // Make a request to Google Books API using axios
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);
        const items = response.data.items || [];
        
        // Map the data from the API response to match your schema
        const books = items.map(item => ({
          id: item.id,
          volumeInfo: {
            authors: item.volumeInfo.authors || [],
            title: item.volumeInfo.title || '',
            description: item.volumeInfo.description || '',
            imageLinks: item.volumeInfo.imageLinks || { thumbnail: '' }
          }
        }));
        
        // Return the formatted data
        return { items: books };
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch data from Google Books API');
      }
    }
  },


  Mutation: {
    login: async (parent, { email, password }) => {
      console.log('Logging in user:', email);
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const correctPassword = await user.isCorrectPassword(password);
      if (!correctPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user);
      console.log('User Data: ', user);
      console.log('Token: ', token);
      return { token, user };
    },

    createUser: async (parent, args) => {
      try {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        console.log(error);
        throw new AuthenticationError('Could not create user');
      }
    },

    saveBook: async (parent, { authors,  description, bookId, image, link, title }, context) => { // Update input to bookData
      if (!context.user) {
        console.log('User not authenticated');
        throw new AuthenticationError('You must be logged in to save a book');
      }
  
      try {
        console.log('Saving book:', authors,  description, bookId, image, link, title);
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: 
            authors,
            description,
            bookId,
            image,
            link,
            title 
          }},
          { new: true, runValidators: true }
        ).populate('savedBooks');

        console.log('Updated User: ', updatedUser);
  
        return updatedUser;
      } catch (error) {
        console.log(error);
        throw new AuthenticationError('Could not save book');
      }
    },

    deleteBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to remove a book');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      } catch (error) {
        console.log(error);
        throw new AuthenticationError('Could not remove book');
      }
    },
  },
};

module.exports = resolvers;
