import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class BillSummaryVote extends AbstractModel {
        static associate(models) {
            this.belongsTo(sequelize.models.bill_detail_votes, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bill_detail_votes',
            })
            this.belongsTo(sequelize.models.bill_motions, {
                foreignKey: 'motion_id',
                targetKey: 'motion_id',
                as: 'bill_motions',
            })
            this.belongsTo(sequelize.models.location_codes, {
                foreignKey: 'location_code',
                targetKey: 'location_code',
                as: 'location_codes',
            })
        }
    }
    BillSummaryVote.init(
        {
            bill_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            location_code: {
                type: DataTypes.STRING(6),
                allowNull: false,
            },
            vote_date_time: {
                type: DataTypes.DATE,
            },
            vote_date_seq: {
                type: DataTypes.INTEGER,
            },
            motion_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ayes: {
                type: DataTypes.INTEGER,
            },
            noes: {
                type: DataTypes.INTEGER,
            },
            abstain: {
                type: DataTypes.INTEGER,
            },
            vote_result: {
                type: DataTypes.STRING(6),
            },
            trans_uid: {
                type: DataTypes.STRING(30),
            },
            trans_update: {
                type: DataTypes.DATE,
            },
            file_item_num: {
                type: DataTypes.STRING(10),
            },
            file_location: {
                type: DataTypes.STRING(50),
            },
            display_lines: {
                type: DataTypes.STRING(2000),
            },
            session_date: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'bill_summary_votes',
        }
    )

    return BillSummaryVote
}
