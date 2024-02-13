import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class ClientBillTracking extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.bills, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bills',
            })
        }
        static associateManually() {
            this.belongsTo(sequelize.models.clients, {
                foreignKey: 'client_id',
                targetKey: 'id',
                as: 'bill_clients',
            })
        }
    }
    ClientBillTracking.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            client_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            bill_id: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            bill_version_id: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            stance: {
                type: DataTypes.ENUM('support', 'oppose', 'neutral'),
                validate: {
                    isIn: {
                        args: [['support', 'oppose', 'neutral']],
                        msg: translate('validations', 'valid', {
                            ':attribute': 'stance',
                        }),
                    },
                },
            },
            keyword_track: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            keywords: {
                type: DataTypes.JSON,
            },
            reasons: {
                type: DataTypes.JSON,
                allowNull: false,
            },
        },
        {
            sequelize,
            freezeTableName: true,
            modelName: 'client_bill_tracking',
            timestamps: true,
            paranoid: true,
        }
    )

    return ClientBillTracking
}
