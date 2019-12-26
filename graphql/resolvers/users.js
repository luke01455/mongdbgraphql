const User = require('../../models/Users')
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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
            })
        }
    }
}