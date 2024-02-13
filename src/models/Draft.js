import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class Draft extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.businesses, {
                foreignKey: 'business_id',
                targetKey: 'id',
                as: 'business',
            })
            this.belongsTo(sequelize.models.users, {
                foreignKey: 'user_id',
                targetKey: 'id',
                as: 'user',
            })
            this.belongsTo(sequelize.models.bills, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bills',
            })
        }
    }
    Draft.init(
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
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Business Id',
                        }),
                    },
                },
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
            clients: {
                type: DataTypes.JSON,
            },
            stance: {
                type: DataTypes.ENUM(
                    'support',
                    'oppose',
                    'request-for-signature',
                    'request-for-veto'
                ),
                validate: {
                    isIn: {
                        args: [
                            [
                                'support',
                                'oppose',
                                'request-for-signature',
                                'request-for-veto',
                            ],
                        ],
                        msg: translate('validations', 'valid', {
                            ':attribute': 'stance',
                        }),
                    },
                },
            },
            talking_points: {
                type: DataTypes.JSON,
            },
            instructions: {
                type: DataTypes.TEXT,
            },
            send_to: {
                type: DataTypes.STRING(100),
            },
            writing_style: {
                type: DataTypes.JSON,
            },
            output: {
                type: DataTypes.TEXT,
            },
            is_processing: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            response_time: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
        },
        {
            sequelize,
            modelName: 'drafts',
            timestamps: true,
        }
    )

    return Draft
}
