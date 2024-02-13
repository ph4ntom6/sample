import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class BillVersionAuthor extends AbstractModel {
        static associate(models) {}
    }
    BillVersionAuthor.init(
        {
            bill_version_id: {
                type: DataTypes.STRING(30),
                primaryKey: true,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING(15),
            },
            house: {
                type: DataTypes.STRING(100),
            },
            name: {
                type: DataTypes.STRING(100),
            },
            contribution: {
                type: DataTypes.STRING(100),
            },
            committee_members: {
                type: DataTypes.STRING(2000),
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
            primary_author_flg: {
                type: DataTypes.STRING(1),

                defaultValue: 'N',
            },
        },
        {
            sequelize,
            modelName: 'bill_version_authors',
            timestamps: false,
        }
    )

    return BillVersionAuthor
}
