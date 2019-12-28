const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')
const { SECRET_KEY } = require('../../config/config')
const User = require('../../models/User')



module.exports = {
    Mutation: {
        async register(parent, { registerInput : { username, email, password, confirmPassword }}, context, info) {
            const  { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)
            if(!valid) {
                // pass the errors from the validate file
                throw new UserInputError('Errors', { errors })
            }
            const userExists = await User.findOne({ username })
            const emailExists = await User.findOne({ email })

            if (userExists) {
                throw new UserInputError('Username already exists', {
                    error: {
                        username: 'This username is taken'
                    }
                })
            }
            
            if (emailExists) {
                throw new UserInputError('Email already exists', {
                    error: {
                        email: 'This email is taken'
                    }
                })
            }
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            })
        
            const res = await newUser.save();

            const token = jwt.sign({
                id: res.id,
                email: res.email,
                username: res.username
            }, SECRET_KEY, { expiresIn: '2h'})

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}