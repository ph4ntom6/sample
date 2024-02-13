import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class ClientScorcard extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.clients, {
                foreignKey: 'client_id',
                targetKey: 'id',
                as: 'client',
            })
        }
    }
    ClientScorcard.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
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
            client_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Client Id',
                        }),
                    },
                },
            },
            value: {
                type: DataTypes.JSON,
            },
        },
        {
            sequelize,
            modelName: 'client_scorecards',
            timestamps: true,
            paranoid: true,
        }
    )

    return ClientScorcard
}
