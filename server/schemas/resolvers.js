const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async (_, __, context) => {
        // Ensure the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('You must be logged in to view this information');
        }
  
        const foundUser = await User.findOne({ _id: context.user.id }).populate('savedBooks');
        return foundUser;
      },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const correctPassword = await user.isCorrectPassword(password);
      if (!correctPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (_, args) => {
      try {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        console.log(error);
        throw new AuthenticationError('Could not create user');
      }
    },

    saveBook: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save a book');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user.id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        ).populate('savedBooks');

        return updatedUser;
      } catch (error) {
        console.log(error);
        throw new AuthenticationError('Could not save book');
      }
    },

    removeBook: async (_, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to remove a book');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user.id },
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
