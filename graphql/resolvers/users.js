const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')
const { SECRET_KEY } = require('../../config/config')
const User = require('../../models/User')

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '2h'})
}

module.exports = {
    Mutation: {
        async login(parent, { username, password }, context, info) {
            const { errors, valid } = validateLoginInput(username, password)

            if(!valid){
                throw new UserInputError('Errors', { errors })
            }

            const user = await User.findOne({ username })

            if(!user){
                errors.general = 'User not found'
                throw new UserInputError('User not found', { errors })
            }

            const match = await bcrypt.compare(password, user.password)
            if(!match) {
                errors.general = 'Incorrect credentials entered'
                throw new UserInputError('Incorrect credentials entered', { errors })
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
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

            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}