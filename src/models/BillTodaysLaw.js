import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class BillTodaysLaw extends AbstractModel {
        static associate(models) {}
    }
    BillTodaysLaw.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
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
            content: {
                type: DataTypes.TEXT,
            },
            bill_version_id: {
                type: DataTypes.STRING(30),
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Bill Version Id',
                        }),
                    },
                },
            },
        },
        {
            sequelize,
            modelName: 'bill_todays_laws',
            timestamps: true,
        }
    )

    return BillTodaysLaw
}
