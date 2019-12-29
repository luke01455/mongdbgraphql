const { AuthenticationError, UserInputError } = require('apollo-server')
const Post = require('../../models/Post')
const checkAuth = require('../../utils/checkAuth')

module.exports = {
    Query: {
        async getPosts(){
            try{
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch(err) {
                throw new Error(err)
            }
        },
        async getPost(parent, { postId}, context, info ){
            try{
                const post = await Post.findById(postId);
                if(post){
                    return post
                } else {
                    throw new Error('Post not found')
                }
            } catch(err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async createPost(parent, { body }, ctx, info){
            //authorization
            const user = checkAuth(ctx);
            console.log(user)

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save();

            return post;
        },
        async deletePost(parent, { postId }, ctx) {
            const user = checkAuth(ctx)

            try {
                const post = await Post.findById(postId);
                if(user.username === post.username){
                    await post.delete();
                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch(err){
                throw new Error(err)
            }
        },
        async likePost(parent, { postId }, context){
            const { username } = checkAuth(context)

            const post = await Post.findById(postId)
            if(post) {
                if(post.likes.find(like => like.username === username)){
                    // post already likes, unlike it
                    post.likes = post.likes.filter(like => like.username !== username)
                    await post.save()
                } else {
                    // not liked, like post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else throw new UserInputError('Post not found')

        }
    },
    Subscription: {
        newPost: {
            subscribe:(parent, args, { pubsub }) => pubsub.asyncIterator()
        }
    }
}  