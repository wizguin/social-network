import Sequelize from 'sequelize'
// Tables
import Users from './tables/Users'
import Followings from './tables/Followings'
import Posts from './tables/Posts'


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

    /*========== User data find functions ==========*/

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

    /*========== Helper functions ==========*/

    getTimestamp() {
        return Math.round((new Date()).getTime() / 1000)
    }

    getFollowings(id) {
        return this.followings.findAll({ where: { userId: id } }).then(function(result) {
            let followings = []

            for (let following of result) {
                followings.push(following.followingId)
            }

            return followings
        })
    }

    isFollowing(id, followingId) {
        return this.getFollowings(id).then(function(followings) {
            return (followings.includes(followingId)) ? true : false
        })
    }

    getPosts(id) {
        return this.posts.findAll({ where: { userId: id }, order: [['timestamp', 'DESC']] }).then(function(result) {
            let posts = []

            for (let post of result) {
                posts.push({
                    text: post.text,
                    image: post.image,
                    timestamp: post.timestamp
                })
            }

            return posts
        })
    }

}
