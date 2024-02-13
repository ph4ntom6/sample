import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class Alert extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.bills, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bill',
            })
        }
        static associateManually(models) {
            this.hasMany(sequelize.models.read_alerts, {
                sourceKey: 'id',
                foreignKey: 'alert_id',
                as: 'read_alerts',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
        }
    }
    Alert.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },

            bill_id: {
                type: DataTypes.STRING(19),
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Bill Id',
                        }),
                    },
                },
            },
            business_id: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
            user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
            bill_subject: {
                type: DataTypes.TEXT,
            },
            clients: {
                type: DataTypes.JSON,
            },
            details: {
                type: DataTypes.TEXT,
            },
            bill_status: {
                type: DataTypes.STRING(100),
            },
            bill_history_id: {
                type: DataTypes.DECIMAL(20, 0),
            },
            action_date: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'alerts',
            timestamps: true,
        }
    )

    return Alert
}
