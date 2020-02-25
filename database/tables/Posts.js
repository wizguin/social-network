import Sequelize from 'sequelize'


export default class Posts extends Sequelize.Model {

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
                text: {
                    type: DataTypes.STRING(300),
                    allowNull: false,
                    field: 'text'
                },
                image: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'image'
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
