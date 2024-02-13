import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class NotificationLock extends AbstractModel {
        static associate(models) {}
    }
    NotificationLock.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING(100),
            },
        },
        {
            sequelize,
            modelName: 'notification_locks',
            timestamps: true,
        }
    )

    return NotificationLock
}
