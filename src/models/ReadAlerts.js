import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class ReadAlert extends AbstractModel {
        static associate(models) {}
    }
    ReadAlert.init(
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
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'User Id',
                        }),
                    },
                },
            },
            alert_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Alert Id',
                        }),
                    },
                },
            },
        },
        {
            sequelize,
            modelName: 'read_alerts',
            timestamps: true,
        }
    )

    return ReadAlert
}
