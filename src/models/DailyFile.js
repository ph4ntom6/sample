import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class DailyFile extends AbstractModel {
        static associate(models) {}
    }
    DailyFile.init(
        {
            bill_id: {
                type: DataTypes.STRING(20),
            },
            location_code: {
                type: DataTypes.STRING(6),
            },
            consent_calendar_code: {
                type: DataTypes.INTEGER,
            },
            file_location: {
                type: DataTypes.STRING(6),
            },
            publication_date: {
                type: DataTypes.DATE,
            },
            floor_manager: {
                type: DataTypes.STRING(100),
            },
            trans_uid: {
                type: DataTypes.STRING(20),
            },
            trans_update_date: {
                type: DataTypes.DATE,
            },
            session_num: {
                type: DataTypes.STRING(2),
            },
            status: {
                type: DataTypes.STRING(200),
            },
        },
        {
            sequelize,
            modelName: 'daily_files',
        }
    )

    return DailyFile
}
