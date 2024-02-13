import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class Bill extends AbstractModel {
        static associate(models) {
            this.hasMany(sequelize.models.bill_versions, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'versions',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })

            this.hasMany(sequelize.models.bill_codes, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bill_codes',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasOne(sequelize.models.bill_todays_laws, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bill_todays_laws',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
        }
        static associateManually() {
            this.belongsTo(sequelize.models.bill_versions, {
                foreignKey: 'latest_bill_version_id',
                targetKey: 'bill_version_id',
                as: 'version',
            })
            this.hasMany(sequelize.models.bill_version_authors, {
                sourceKey: 'latest_bill_version_id',
                foreignKey: 'bill_version_id',
                as: 'authors',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasMany(sequelize.models.client_bill_impacts, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'client_bill_impacts',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasMany(sequelize.models.client_bill_tracking, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'client_bill_trackings',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
            this.hasMany(sequelize.models.user_bill_tracking, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'user_bill_trackings',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            })
        }
    }
    Bill.init(
        {
            bill_id: {
                type: DataTypes.STRING(19),
                primaryKey: true,
                allowNull: false,
            },
            session_year: {
                type: DataTypes.STRING(8),
            },
            session_num: {
                type: DataTypes.STRING(2),
            },
            measure_type: {
                type: DataTypes.STRING(4),
            },
            measure_num: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
            measure_state: {
                type: DataTypes.STRING(40),
            },
            chapter_year: {
                type: DataTypes.STRING(4),
            },
            chapter_type: {
                type: DataTypes.STRING(10),
            },
            chapter_session_num: {
                type: DataTypes.STRING(2),
            },
            chapter_num: {
                type: DataTypes.STRING(10),
            },
            latest_bill_version_id: {
                type: DataTypes.STRING(30),
            },
            active_flg: {
                type: DataTypes.STRING(1),
                defaultValue: 'Y',
            },
            trans_uid: {
                type: DataTypes.STRING(30),
            },
            trans_update: {
                type: DataTypes.DATE,
            },
            current_location: {
                type: DataTypes.STRING(200),
            },
            current_secondary_loc: {
                type: DataTypes.STRING(60),
            },
            current_house: {
                type: DataTypes.STRING(60),
            },
            current_status: {
                type: DataTypes.STRING(60),
            },
            days_31st_in_print: {
                type: DataTypes.DATE,
            },
            bill_num: {
                type: DataTypes.STRING(100),
            },
        },
        {
            sequelize,
            modelName: 'bills',
            timestamps: false,
        }
    )

    return Bill
}
