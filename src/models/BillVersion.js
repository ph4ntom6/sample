import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class BillVersion extends AbstractModel {
        static associate(models) {}
        static associateManually(models) {
            this.hasMany(sequelize.models.bill_version_authors, {
                sourceKey: 'bill_version_id',
                foreignKey: 'bill_version_id',
                as: 'authors',
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
            this.belongsTo(sequelize.models.bills, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bill',
            })
        }
    }
    BillVersion.init(
        {
            bill_version_id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                allowNull: false,
            },
            bill_id: {
                type: DataTypes.STRING(19),
            },
            version_num: {
                type: DataTypes.INTEGER,
            },
            bill_version_action_date: {
                type: DataTypes.DATE,
            },
            bill_version_action: {
                type: DataTypes.STRING(100),
            },
            request_num: {
                type: DataTypes.STRING(10),
            },
            subject: {
                type: DataTypes.STRING(1000),
            },
            vote_required: {
                type: DataTypes.STRING(100),
            },
            appropriation: {
                type: DataTypes.STRING(3),
            },
            fiscal_committee: {
                type: DataTypes.STRING(3),
            },
            local_program: {
                type: DataTypes.STRING(3),
            },
            substantive_changes: {
                type: DataTypes.STRING(3),
            },
            urgency: {
                type: DataTypes.STRING(3),
            },
            taxlevy: {
                type: DataTypes.STRING(3),
            },
            bill_xml: {
                type: DataTypes.TEXT('long'),
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
            summary: {
                type: DataTypes.TEXT,
            },
            impacts: {
                type: DataTypes.JSON,
            },
            bill_html: {
                type: DataTypes.TEXT('long'),
            },
            pdf_exists: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: false,
            },
            key_points: {
                type: DataTypes.JSON,
            },
            assistant_id: {
                type: DataTypes.STRING(100),
            },
            assistant_id_code: {
                type: DataTypes.STRING(100),
            },
            code_interpreter: {
                type: DataTypes.STRING(10),
            },
            response_time: {
                type: DataTypes.INTEGER.UNSIGNED,
            },
        },
        {
            sequelize,
            modelName: 'bill_versions',
            timestamps: false,
        }
    )

    return BillVersion
}
