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
                    type: DataTypes.STRING(12),
                    allowNull: false,
                    field: 'username'
                },
                password: {
                    type: DataTypes.CHAR(60),
                    allowNull: false,
                    field: 'password'
                },
                email: {
                    type: DataTypes.STRING(254),
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
                }
            },
            { sequelize, timestamps: false }
        )
    }

}
