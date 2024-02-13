import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class Conversation extends AbstractModel {
        static associate(models) {}
    }
    Conversation.init(
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
            thread_id: {
                type: DataTypes.STRING(100),
            },
            assistant_id: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Assistant Id',
                        }),
                    },
                },
            },
        },
        {
            sequelize,
            modelName: 'conversations',
            timestamps: true,
        }
    )

    return Conversation
}
