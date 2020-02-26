import Sequelize from 'sequelize'
// Tables
import Users from './tables/Users'
import Followings from './tables/Followings'
import Posts from './tables/Posts'
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

    /*========== Profile page queries ==========*/

    getPosts(id) {
        return this.posts.findAll({ where: { userId: id }, order: [['timestamp', 'DESC']] }).then((result) => {
            let posts = []

            for (let post of result) {
                posts.push({
                    text: post.text,
                    image: post.image,
                    timestamp: this.timestampToDate(post.timestamp)
                })
            }

            return posts
        })
    }

    getPostCount(id) {
        return this.posts.count({ where: { userId: id } }).then(function(result) {
            return result
        })
    }

    getLikes(id) {
        return this.likes.findAll({ where: { userId: id }, order: [['timestamp', 'DESC']] }).then(function(result) {
            let likes = []

            for (let like of result) {
                likes.push(like.postId)
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
        return this.followings.findAll({ where: { followingId: id } }).then(async (result) => {
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
        return this.followings.findAll({ where: { userId: id } }).then(async (result) => {
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

}
