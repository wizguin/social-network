import Sequelize from 'sequelize'
// Tables
import Users from './tables/Users'
import Followings from './tables/Followings'


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

        // Associations
        this.users.hasMany(this.followings, { foreignKey: 'id' })
        this.followings.belongsTo(this.users, { foreignKey: 'userId' })
        this.followings.belongsTo(this.users, { foreignKey: 'followingId' })

        this.sequelize
            .authenticate()
            .then(() => {
                console.log('Connected to database')
            })
            .catch(error => {
                console.error('Unable to connect to the database: ', error)
            })
    }

    /*========== User data find functions ==========*/

    findByUsername(username) {
        return this.users.findOne({ where: { username: username } }).then((userData) => {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    findByEmail(email) {
        return this.users.findOne({ where: { email: email } }).then((userData) => {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    findById(id) {
        return this.users.findOne({ where: { id: id } }).then((userData) => {
            if (userData) {
                return userData
            } else {
                return null
            }
        })
    }

    usernameToId(username) {
        return this.findByUsername(username).then(userData => {
            return (userData.id)
        })
    }

    /*==========  ==========*/

    getFollowings(id) {
        return this.followings.findAll({ where: { userId: id } }).then(following => {
            let followings = []

            for (let result of following) {
                followings.push(result.followingId)
            }

            return followings
        })
    }

    isFollowing(id, followingId) {
        return this.getFollowings(id).then(followings => {
            return (followings.includes(followingId)) ? true : false
        })
    }

}
