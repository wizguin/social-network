import Sequelize from 'sequelize'


export default class Replies extends Sequelize.Model {

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
                postId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'post_id'
                },
                replyId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    field: 'reply_id'
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
