import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class Calendar extends AbstractModel {
        static associate(models) {}
    }
    Calendar.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.TEXT,
            },
            start_date: {
                type: DataTypes.DATE,
            },
            end_date: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'calendar',
            timestamps: true,
            freezeTableName: true,
        }
    )

    return Calendar
}
