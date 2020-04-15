import Sequelize from 'sequelize'
import pug from 'pug'
import path from 'path'

import * as queries from './queries'

import Users from './tables/Users'
import Followings from './tables/Followings'
import Posts from './tables/Posts'
import Reposts from './tables/Reposts'
import Likes from './tables/Likes'
import Replies from './tables/Replies'


export default class Database {

    constructor() {
        this.sequelize = new Sequelize(
            process.env.DATABASE,
            process.env.USER,
            process.env.PASSWORD, {
                host: process.env.HOST,
                dialect: process.env.DIALECT
            }
        )

        // Tables
        this.users = Users.init(this.sequelize, Sequelize)
        this.followings = Followings.init(this.sequelize, Sequelize)
        this.posts = Posts.init(this.sequelize, Sequelize)
        this.reposts = Reposts.init(this.sequelize, Sequelize)
        this.likes = Likes.init(this.sequelize, Sequelize)
        this.replies = Replies.init(this.sequelize, Sequelize)

        this.sequelize
            .authenticate()
            .then(function() {
                console.log('Connected to database')
            })
            .catch(function(error) {
                console.error('Unable to connect to the database: ', error)
            })

        // Pagination
        this.limit = 10
    }

    /*========== User data find queries ==========*/

    getUserByUsername(username) {
        return this.users.findOne({ where: { username: username } }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    getUserByEmail(email) {
        return this.users.findOne({ where: { email: email } }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    getUserById(id) {
        return this.users.findOne({ where: { id: id } }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    usernameToId(username) {
        return this.getUserByUsername(username).then(function(userData) {
            return (userData.id)
        })
    }

    idToUsername(id) {
        return this.getUserById(id).then(function(userData) {
            return (userData.username)
        })
    }

    /*========== Post find queries ==========*/

    getPostById(id) {
        return this.posts.findOne({ where: { id: id } }).then(function(post) {
            if (post) {
                return post
            } else {
                return null
            }
        })
    }

    /*========== Home page queries ==========*/

    async getFeed(myId, page) {
        let followings = await this.getFollowingsList(myId)
        followings.push(myId)
        return await this.getPosts({ id: followings, myId: myId }, page)
    }

    getFollowingsList(id) {
        return this.followings.findAll({ where: { userId: id } }).then(async (result) => {
            return result.map(function(following) {
                return following.followingId
            })
        })
    }

    /*========== Profile page queries ==========*/

    getPosts(id, page) {
        return this.sequelize.query(
            queries.posts, {
                replacements: {
                    profileId: id.id,
                    userId: id.myId,
                    limit: this.limit,
                    offset: page * this.limit
                },
                type: this.sequelize.QueryTypes.SELECT
            }

        ).then(async (result) => {
            for (let post of result) {
                post.avatar = post.user_id
                post.timestamp = this.timestampToDate(post.timestamp)
                if (post.originalTimestamp) post.originalTimestamp = this.timestampToDate(post.originalTimestamp)
                if (post.isReply) post.originalPoster = await this.getOriginalPoster(post.id)
            }

            return result
        })
    }

    async getOriginalPoster(id) {
        return this.replies.findOne({ where: { replyId: id } }).then(function(result) {
            return result

        }).then(async (result) => {
            let originalPost = await this.getPostById(result.postId)
            return await this.idToUsername(originalPost.userId)
        })
    }

    getLikes(id, page) {
        return this.likes.findAll({
            limit: this.limit,
            offset: page * this.limit,
            where: { userId: id.id },
            order: [['timestamp', 'DESC']]

        }).then(async (result) => {
            let likes = []

            for (let like of result) {
                let post = await this.getPostById(like.postId)

                if (post) {
                    let user = await this.getUserById(post.userId)

                    likes.push(await this.createPostObj(user, post, id.myId))
                }
            }

            return likes
        })
    }

    getFollowers(id, page) {
        return this.followings.findAll({
            limit: this.limit,
            offset: page * this.limit,
            where: { followingId: id.id }

        }).then(async (result) => {
            let followers = []

            for (let follower of result) {
                followers.push({
                    username: await this.idToUsername(follower.userId),
                    avatar: follower.userId
                })
            }

            return followers
        })
    }

    getFollowings(id, page) {
        return this.followings.findAll({
            limit: this.limit,
            offset: page * this.limit,
            where: { userId: id.id }

        }).then(async (result) => {
            let followings = []

            for (let following of result) {
                followings.push({
                    username: await this.idToUsername(following.followingId),
                    avatar: following.followingId
                })
            }

            return followings
        })
    }

    /*========== Post counts ==========*/

    getPostCount(id) {
        return this.posts.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    getLikeCount(id) {
        return this.likes.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    getFollowerCount(id) {
        return this.followings.count({ where: { followingId: id } }).then(function(result) {
            return result
        })
    }

    getFollowingCount(id) {
        return this.followings.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    /*========== Threads ==========*/

    async getThread(id, myId, page) {
        let thread = { replyTo: null }
        let focus = await this.getPostById(id)
        let focusPoster = await this.getUserById(focus.userId)
        let isReply = await this.isReply(id)

        if (isReply) {
            let originalPost = await this.getPostById(isReply.postId)
            let originalPoster = await this.getUserById(originalPost.userId)
            thread.replyTo = await this.createPostObj(originalPoster, originalPost, myId)
        }

        thread.focus = await this.createPostObj(focusPoster, focus, myId)

        return this.replies.findAll({
            limit: this.limit,
            offset: page * this.limit,
            where: { postId: id },
            order: [['timestamp', 'DESC']]

        }).then(async (result) => {
            let replies = []

            for (let reply of result) {
                let post = await this.getPostById(reply.replyId)
                let poster = await this.getUserById(post.userId)

                replies.push(await this.createPostObj(poster, post, myId))
            }

            thread.replies = replies
            return thread
        })
    }

    /*========== Helper functions ==========*/

    getTimestamp() {
        return Math.round((new Date()).getTime() / 1000)
    }

    timestampToDate(timestamp) {
        let date = new Date(timestamp * 1000)

        let day = date.getDate()
        let month = date.getMonth()
        let year = date.getFullYear().toString().substr(-2)
        let hours = `${date.getHours()}`.padStart(2, '0')
        let minutes = `${date.getMinutes()}`.padStart(2, '0')

        return `${month}/${day}/${year} ${hours}:${minutes}`
    }

    isFollowing(id, followingId) {
        return this.followings.findOne({ where: { userId: id, followingId: followingId } }).then(function(result) {
            return (result) ? true : false
        })
    }

    isLiked(id, postId) {
        return this.likes.findOne({ where: { userId: id, postId: postId } }).then(function(result) {
            return (result) ? true : false
        })
    }

    isReply(id) {
        return this.replies.findOne({ where: { replyId: id } }).then(function(result) {
            return (result) ? result : false
        })
    }

    async createPostObj(poster, post, userId) {
        return {
            username: poster.username,
            avatar: post.userId,
            id: post.id,
            text: post.text,
            image: post.image,
            timestamp: this.timestampToDate(post.timestamp),
            isLiked: await this.isLiked(userId, post.id)
        }
    }

    renderMixin(file, mixin, args) {
        let include = path.join(__dirname, `../views/mixins/${file}`)
        let code = `include ${include}\n` +
                   `+${mixin}(args)`
        return pug.compile(code, { filename: 'tmp.pug' } )({ args: args })
    }

}
