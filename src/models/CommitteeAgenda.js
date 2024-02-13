import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class CommitteeAgenda extends AbstractModel {
        static associate(models) {}
    }
    CommitteeAgenda.init(
        {
            committee_code: {
                type: DataTypes.STRING(200),
            },
            committee_desc: {
                type: DataTypes.STRING(1000),
            },
            agenda_date: {
                type: DataTypes.DATE,
            },
            agenda_time: {
                type: DataTypes.STRING(200),
            },
            line1: {
                type: DataTypes.STRING(500),
            },
            line2: {
                type: DataTypes.STRING(500),
            },
            line3: {
                type: DataTypes.STRING(500),
            },
            building_type: {
                type: DataTypes.STRING(200),
            },
            room_num: {
                type: DataTypes.STRING(100),
            },
        },
        {
            sequelize,
            modelName: 'committee_agendas',
        }
    )

    return CommitteeAgenda
}
