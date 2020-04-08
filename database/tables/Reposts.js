import Sequelize from 'sequelize'


export default class Reposts extends Sequelize.Model {

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
                postId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'post_id'
                },
                timestamp: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'timestamp'
                }
            },
            { sequelize, timestamps: false }
        )
    }

}
