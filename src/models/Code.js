import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class Code extends AbstractModel {
        static associate(models) {}
    }
    Code.init(
        {
            code: {
                type: DataTypes.STRING(5),
                allowNull: false,
                unique: true,
            },
            title: {
                type: DataTypes.STRING(2000),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'codes',
        }
    )

    return Code
}
