import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class Client extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.businesses, {
                foreignKey: 'business_id',
                targetKey: 'id',
                as: 'business',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.belongsTo(sequelize.models.users, {
                foreignKey: 'associate_id',
                targetKey: 'id',
                as: 'associate',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.belongsTo(sequelize.models.industries, {
                foreignKey: 'industry_id',
                targetKey: 'id',
                as: 'industry',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasMany(sequelize.models.client_bill_impacts, {
                foreignKey: 'client_id',
                sourceKey: 'id',
                as: 'client_impacts',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasMany(sequelize.models.client_bill_tracking, {
                foreignKey: 'client_id',
                sourceKey: 'id',
                as: 'client_bill_trackings',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
        }
    }
    Client.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            client_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
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
            associate_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Associate Id',
                        }),
                    },
                },
            },
            industry_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Industry Id',
                        }),
                    },
                },
            },
            industry_title: {
                type: DataTypes.STRING(100),
            },
            status: {
                type: DataTypes.ENUM,
                values: ['active', 'in-active'],
                defaultValue: 'active',
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['active', 'in-active']],
                        msg: translate('validations', 'valid', {
                            ':attribute': 'status',
                        }),
                    },
                },
            },
            short_bio: {
                type: DataTypes.TEXT,
            },
            cp_name: {
                type: DataTypes.STRING(100),
            },
            cp_email: {
                type: DataTypes.STRING(100),
            },
            cp_phone: {
                type: DataTypes.STRING(100),
            },
            cp_address: {
                type: DataTypes.STRING(100),
            },
            interests_goals: {
                type: DataTypes.JSON,
            },
            tracking_bills: {
                type: DataTypes.JSON,
            },
            tracking_keywords: {
                type: DataTypes.JSON,
            },
        },
        {
            sequelize,
            modelName: 'clients',
            timestamps: true,
            paranoid: true,
        }
    )

    return Client
}
