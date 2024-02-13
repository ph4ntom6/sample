import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class ClientBillImpact extends AbstractModel {
        static associate(models) {}
        static associateManually() {
            this.belongsTo(sequelize.models.clients, {
                foreignKey: 'client_id',
                targetKey: 'id',
                as: 'client',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
        }
    }
    ClientBillImpact.init(
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
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Client Id',
                        }),
                    },
                },
            },
            bill_id: {
                type: DataTypes.STRING(100),
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
            positive_impact_count: {
                type: DataTypes.INTEGER,
            },
            positive_impact_content: {
                type: DataTypes.JSON,
            },
            negative_impact_count: {
                type: DataTypes.INTEGER,
            },
            negative_impact_content: {
                type: DataTypes.JSON,
            },
            no_impact_count: {
                type: DataTypes.INTEGER,
            },
            no_impact_content: {
                type: DataTypes.JSON,
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
            modelName: 'client_bill_impacts',
            timestamps: true,
            paranoid: true,
        }
    )

    return ClientBillImpact
}
