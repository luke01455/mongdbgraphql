const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')

const resolvers = require('./graphql/resolvers')
const { MONGODB } = require('./config/config.js')

const server = new ApolloServer({
    typeDefs,
    resolvers
})

mongoose.connect(MONGODB, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log('MongoDb connected')
        return server.listen({ port: 5000 })
    }) 
    .then(res => {
        console.log(`Server running at ${res.url}`)
    })