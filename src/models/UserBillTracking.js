import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class UserBillTracking extends AbstractModel {
        static associate(models) {}
    }
    UserBillTracking.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            business_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            bill_id: {
                type: DataTypes.STRING(19),
                allowNull: false,
            },
            bill_version_id: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
        },
        {
            sequelize,
            freezeTableName: true,
            modelName: 'user_bill_tracking',
            timestamps: true,
            paranoid: true,
        }
    )

    return UserBillTracking
}
