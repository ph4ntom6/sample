import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class Business extends AbstractModel {
        static associate(models) {}
        static associateManually(models) {
            this.hasMany(sequelize.models.clients, {
                foreignKey: 'businessId',
                targetKey: 'id',
                as: 'business_clients',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasMany(sequelize.models.users, {
                foreignKey: 'businessId',
                targetKey: 'id',
                as: 'business_users',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
        }
    }
    Business.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
            },
            status: {
                type: DataTypes.ENUM,
                values: ['active', 'blocked'],
                defaultValue: 'active',
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['active', 'blocked']],
                        msg: translate('validations', 'valid', {
                            ':attribute': 'status',
                        }),
                    },
                },
            },
            contact_info: {
                type: DataTypes.JSON,
            },
        },
        {
            sequelize,
            modelName: 'businesses',
            timestamps: true,
        }
    )

    return Business
}
