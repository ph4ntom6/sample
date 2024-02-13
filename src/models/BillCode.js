import { AbstractModel } from './AbstractModel'

import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class BillCode extends AbstractModel {
        static associate(models) {}
    }
    BillCode.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            code: {
                type: DataTypes.STRING(5),
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Code',
                        }),
                    },
                },
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
            modelName: 'bill_codes',
        }
    )

    return BillCode
}
