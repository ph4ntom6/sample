import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class BillMotion extends AbstractModel {
        static associate(models) {}
    }
    BillMotion.init(
        {
            motion_id: {
                type: DataTypes.DECIMAL(20, 0),
                primaryKey: true,
                allowNull: false,
            },
            motion_text: {
                type: DataTypes.STRING(250),
            },
            trans_uid: {
                type: DataTypes.STRING(30),
            },
            trans_update: {
                type: DataTypes.DATE,
            },
        },
        {
            sequelize,
            modelName: 'bill_motions',
        }
    )

    return BillMotion
}
