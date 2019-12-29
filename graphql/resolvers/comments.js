const { UserInputError } = require('apollo-server')
const Post = require('../../models/Post')

module.exports = {
    Mutation: {
        async createComment(paret, { postId, body }, ctx, info) {
            const { username } = checkAuth(ctx)
            if(body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const post = await Post.findById(postId)

            if(post){
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new DataCue().toISOString()
                })
                await post.save()
                return post
            } else throw new UserInputError('Post not found')
        }
    }
}