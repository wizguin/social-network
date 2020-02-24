import Sequelize from 'sequelize'


export default class Users extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    field: 'id'
                },
                username: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    field: 'username'
                },
                password: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    field: 'password'
                },
                email: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    field: 'email'
                },
                registrationTimestamp: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'registration_timestamp'
                },
                bio: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'bio'
                },
                avatar: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'avatar'
                },
                header: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'header'
                },
                followerCount: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: '0',
                    field: 'follower_count'
                },
                followingCount: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: '0',
                    field: 'following_count'
                },
                likeCount: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: '0',
                    field: 'like_count'
                }
            },
            { sequelize, timestamps: false }
        )
    }

}
