import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class CommitteeHearing extends AbstractModel {
        static associate(models) {}
    }
    CommitteeHearing.init(
        {
            bill_id: {
                type: DataTypes.STRING(20),
            },
            committee_type: {
                type: DataTypes.STRING(2),
            },
            committee_nr: {
                type: DataTypes.INTEGER,
            },
            hearing_date: {
                type: DataTypes.DATE,
            },
            location_code: {
                type: DataTypes.STRING(6),
            },
            trans_uid: {
                type: DataTypes.STRING(30),
            },
            trans_update_date: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'committee_hearings',
        }
    )

    return CommitteeHearing
}
