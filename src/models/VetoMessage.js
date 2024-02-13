import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class VetoMessage extends AbstractModel {
        static associate(models) {}
    }
    VetoMessage.init(
        {
            bill_id: {
                type: DataTypes.STRING(20),
            },
            veto_date: {
                type: DataTypes.DATE,
            },
            message: {
                type: DataTypes.TEXT('long'),
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
            modelName: 'veto_messages',
        }
    )

    return VetoMessage
}
