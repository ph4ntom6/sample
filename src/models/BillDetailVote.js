import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class BillDetailVote extends AbstractModel {
        static associate(models) {}
    }
    BillDetailVote.init(
        {
            bill_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                primaryKey: true,
            },
            location_code: {
                type: DataTypes.STRING(6),
            },
            legislator_name: {
                type: DataTypes.STRING(50),
            },
            vote_date_time: {
                type: DataTypes.DATE,
            },
            vote_date_seq: {
                type: DataTypes.INTEGER,
            },
            vote_code: {
                type: DataTypes.STRING(5),
            },
            motion_id: {
                type: DataTypes.INTEGER,
            },
            trans_uid: {
                type: DataTypes.STRING(30),
            },
            trans_update: {
                type: DataTypes.DATE,
            },
            member_order: {
                type: DataTypes.INTEGER,
            },
            session_date: {
                type: DataTypes.DATE,
            },
            speaker: {
                type: DataTypes.STRING(1),
            },
        },
        {
            sequelize,
            modelName: 'bill_detail_votes',
        }
    )

    return BillDetailVote
}
