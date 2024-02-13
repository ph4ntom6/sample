import { AbstractModel } from './AbstractModel'
export default (sequelize, DataTypes) => {
    class BillHistory extends AbstractModel {
        static associate(models) {}
        static associateManually(models) {
            this.belongsTo(sequelize.models.bills, {
                foreignKey: 'bill_id',
                targetKey: 'bill_id',
                as: 'bills',
            })
        }
    }
    BillHistory.init(
        {
            bill_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            bill_history_id: {
                type: DataTypes.DECIMAL(20, 0),
                allowNull: false,
                primaryKey: true,
            },
            action_date: {
                type: DataTypes.DATE,
            },
            action: {
                type: DataTypes.STRING(2000),
            },
            trans_uid: {
                type: DataTypes.STRING(20),
            },
            trans_update_dt: {
                type: DataTypes.DATE,
            },
            action_sequence: {
                type: DataTypes.INTEGER,
            },
            action_code: {
                type: DataTypes.STRING(5),
            },
            action_status: {
                type: DataTypes.STRING(60),
            },
            primary_location: {
                type: DataTypes.STRING(60),
            },
            secondary_location: {
                type: DataTypes.STRING(60),
            },
            ternary_location: {
                type: DataTypes.STRING(60),
            },
            end_status: {
                type: DataTypes.STRING(60),
            },
            alerts_exist: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'bill_histories',
            timestamps: false, // Disable timestamps
        }
    )

    return BillHistory
}
