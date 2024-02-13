import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class Legislator extends AbstractModel {
        static associate(models) {}
    }
    Legislator.init(
        {
            district: {
                type: DataTypes.STRING(5),
            },
            session_year: {
                type: DataTypes.STRING(8),
            },
            legislator_name: {
                type: DataTypes.STRING(30),
            },
            house_type: {
                type: DataTypes.STRING(1),
            },
            author_name: {
                type: DataTypes.STRING(200),
            },
            first_name: {
                type: DataTypes.STRING(30),
            },
            last_name: {
                type: DataTypes.STRING(30),
            },
            middle_initial: {
                type: DataTypes.STRING(1),
            },
            name_suffix: {
                type: DataTypes.STRING(12),
            },
            name_title: {
                type: DataTypes.STRING(34),
            },
            web_name_title: {
                type: DataTypes.STRING(34),
            },
            party: {
                type: DataTypes.STRING(4),
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
            active_legislator: {
                type: DataTypes.STRING(1),

                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'legislators',
        }
    )

    return Legislator
}
