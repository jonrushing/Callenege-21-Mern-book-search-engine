const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth')


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user){
                const data = await User.findOne({
                    _id: context.user._id
                }).select('-__v -password')
                return data;
            }throw new AuthenticationError("You're not logged in!")
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            // check if user exists with email and credentials
            if (!user) {
              throw new AuthenticationError("Incorrect credentials");
            }
            const correctPassword = await user.isCorrectPassword(password);
      
            // check password
            if (!correctPassword) {
              throw new AuthenticationError("Incorrect credentials");
            }
      
            const token = signToken(user);
            return { token, user };
          },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token= signToken(user);
            return { token, user };   
        },
        saveBook: async (parent, { book }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
              );
              return updatedUser;
            }
            throw new AuthenticationError("You're not logged in!");
          },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId }},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You're not logged in!");
        }
        }
    }
module.exports = resolvers;