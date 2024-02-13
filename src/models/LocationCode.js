import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class LocationCode extends AbstractModel {
        static associate(models) {}
    }
    LocationCode.init(
        {
            session_year: {
                type: DataTypes.STRING(8),
            },
            location_code: {
                type: DataTypes.STRING(6),
                allowNull: false,
            },
            location_type: {
                type: DataTypes.STRING(1),
                allowNull: false,
            },
            consent_calendar_code: {
                type: DataTypes.STRING(2),
            },
            description: {
                type: DataTypes.STRING(60),
            },
            long_description: {
                type: DataTypes.STRING(200),
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
            inactive_file_flg: {
                type: DataTypes.STRING(1),
            },
        },
        {
            sequelize,
            modelName: 'location_codes',
        }
    )

    return LocationCode
}
