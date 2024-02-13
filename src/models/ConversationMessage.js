import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class ConversationMessage extends AbstractModel {
        static associate(models) {}
    }
    ConversationMessage.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            conversation_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Conversation Id',
                        }),
                    },
                },
            },
            type: {
                type: DataTypes.ENUM('user', 'ai'),
                validate: {
                    isIn: {
                        args: [['user', 'ai']],
                        msg: translate('validations', 'valid', {
                            ':attribute': 'type',
                        }),
                    },
                },
            },
            value: {
                type: DataTypes.INTEGER,
            },
            message: {
                type: DataTypes.TEXT,
            },
            source: {
                type: DataTypes.STRING(100),
            },
            sender_id: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
            sender_name: {
                type: DataTypes.STRING(255),
            },
            response_time: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
        },
        {
            sequelize,
            modelName: 'conversation_messages',
            timestamps: true,
        }
    )

    return ConversationMessage
}
