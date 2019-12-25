const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag')
const mongoose = require('mongoose');

import typeDefs from './graphql/typeDefs'

const Post = require('./models/Post')
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