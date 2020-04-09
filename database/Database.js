import Sequelize from 'sequelize'
// Tables
import Users from './tables/Users'
import Followings from './tables/Followings'
import Posts from './tables/Posts'
import Reposts from './tables/Reposts'
import Likes from './tables/Likes'


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

        // Associations
        // this.users.hasMany(this.followings, { foreignKey: 'id' })
        // this.followings.belongsTo(this.users, { foreignKey: 'userId' })
        // this.followings.belongsTo(this.users, { foreignKey: 'followingId' })

        // this.users.hasMany(this.posts, { foreignKey: 'id '})
        // this.posts.belongsTo(this.users, { foreignKey: 'userId' })

        this.sequelize
            .authenticate()
            .then(function() {
                console.log('Connected to database')
            })
            .catch(function(error) {
                console.error('Unable to connect to the database: ', error)
            })
    }

    /*========== User data find queries ==========*/

    findByUsername(username) {
        return this.users.findOne({ where: { username: username } }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    findByEmail(email) {
        return this.users.findOne({ where: { email: email } }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    findById(id) {
        return this.users.findOne({ where: { id: id } }).then(function(userData) {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    usernameToId(username) {
        return this.findByUsername(username).then(function(userData) {
            return (userData.id)
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

    /*========== Profile page queries ==========*/

    async getAllPosts(id) {
        let posts = await this.getPosts(id)
        let reposts = await this.getReposts(id)

        return posts.concat(reposts)
    }

    getPosts(id) {
        return this.posts.findAll({ where: { userId: id.profileId }, order: [['timestamp', 'DESC']] }).then(async (result) => {
            let posts = []

            for (let post of result) {
                posts.push({
                    username: id.profile.username,
                    avatar: id.profile.avatar,
                    id: post.id,
                    text: post.text,
                    image: post.image,
                    timestamp: this.timestampToDate(post.timestamp),
                    isLiked: await this.isLiked(id.userId, post.id)
                })
            }

            return posts
        })
    }

    getReposts(id) {
        return this.reposts.findAll({ where: { userId: id.profileId }, order: [['timestamp', 'DESC']] }).then(async (result) => {
            let reposts = []

            for (let repost of result) {
                let post = await this.getPostById(repost.postId)
                let originalPoster = await this.findById(post.userId)

                reposts.push({
                    reposter: id.profile.username,
                    username: originalPoster.username,
                    avatar: originalPoster.avatar,
                    id: post.id,
                    text: post.text,
                    image: post.image,
                    timestamp: this.timestampToDate(repost.timestamp),
                    originalTimestamp: this.timestampToDate(post.timestamp),
                    isLiked: await this.isLiked(id.userId, post.id)
                })
            }

            return reposts
        })
    }

    getPostCount(id) {
        return this.posts.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    getLikes(id) {
        return this.likes.findAll({ where: { userId: id.profileId }, order: [['timestamp', 'DESC']] }).then(async (result) => {
            let likes = []

            for (let like of result) {
                let post = await this.getPostById(like.postId)

                if (post) {
                    let user = await this.findById(post.userId)

                    likes.push({
                        username: user.username,
                        avatar: user.avatar,
                        id: post.id,
                        text: post.text,
                        image: post.image,
                        timestamp: this.timestampToDate(post.timestamp),
                        isLiked: await this.isLiked(id.userId, post.id)
                    })
                }
            }

            return likes
        })
    }

    getLikeCount(id) {
        return this.likes.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    getFollowers(id) {
        return this.followings.findAll({ where: { followingId: id.profileId } }).then(async (result) => {
            let followers = []

            for (let follower of result) {
                let user = await this.findById(follower.userId)

                followers.push({
                    username: user.username,
                    avatar: user.avatar
                })
            }

            return followers
        })
    }

    getFollowerCount(id) {
        return this.followings.count({ where: { followingId: id } }).then(function(result) {
            return result
        })
    }

    getFollowings(id) {
        return this.followings.findAll({ where: { userId: id.profileId } }).then(async (result) => {
            let followings = []

            for (let following of result) {
                let user = await this.findById(following.followingId)

                followings.push({
                    username: user.username,
                    avatar: user.avatar
                })
            }

            return followings
        })
    }

    getFollowingCount(id) {
        return this.followings.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    /*========== Helper functions ==========*/

    getTimestamp() {
        return Math.round((new Date()).getTime() / 1000)
    }

    timestampToDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString()
    }

    isFollowing(id, followingId) {
        return this.followings.findOne({ where: { userId: id, followingId: followingId } }).then(function(result) {
            return (result) ? true : false
        })
    }

    isLiked(id, postId) {
        return this.likes.findOne({ where: { userId: id, postId: postId } }).then(function(result) {
            return (result) ? true: false
        })
    }

}
