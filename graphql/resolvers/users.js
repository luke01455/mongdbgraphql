import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const User = require('../../models/Users')

const { SECRET_KEY } = require('../../config/config')

module.exports = {
    Mutation: {
        async register(parent, { registerInput : { username, email, password, confirmPassword }}, context, info) {
            // TODO: validate user data
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