import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class Industry extends AbstractModel {
        static associate(models) {}
    }
    Industry.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'industries',
            timestamps: true,
        }
    )

    return Industry
}
