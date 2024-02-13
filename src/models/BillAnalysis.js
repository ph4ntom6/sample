import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class BillAnalysis extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.bills, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bill',
            })
        }
    }
    BillAnalysis.init(
        {
            analysis_id: {
                type: DataTypes.DECIMAL(22, 0),
                primaryKey: true,
                allowNull: false,
            },
            bill_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            house: {
                type: DataTypes.STRING(1),
            },
            analysis_type: {
                type: DataTypes.STRING(100),
            },
            committee_code: {
                type: DataTypes.STRING(6),
            },
            committee_name: {
                type: DataTypes.STRING(200),
            },
            amendment_author: {
                type: DataTypes.STRING(100),
            },
            analysis_date: {
                type: DataTypes.DATE,
            },
            amendment_date: {
                type: DataTypes.DATE,
            },
            page_num: {
                type: DataTypes.DECIMAL(22, 0),
            },
            source_doc: {
                type: DataTypes.BLOB('long'),
            },
            released_floor: {
                type: DataTypes.STRING(1),
            },
            active_flg: {
                type: DataTypes.STRING(1),
                defaultValue: 'Y',
            },
            trans_uid: {
                type: DataTypes.STRING(20),
            },
            trans_update: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'bill_analysis',
            freezeTableName: true,
            timestamps: false,
        }
    )

    return BillAnalysis
}
