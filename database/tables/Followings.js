import Sequelize from 'sequelize'


export default class Followings extends Sequelize.Model {

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
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'user_id'
                },
                followingId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'following_id'
                }
            },
            { sequelize, timestamps: false }
        )
    }

}
