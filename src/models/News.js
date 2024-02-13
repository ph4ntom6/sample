import { AbstractModel } from './AbstractModel'

/** import helpers */
import translate from '../helpers/translate'

export default (sequelize, DataTypes) => {
    class News extends AbstractModel {
        static associate(models) {}
    }
    News.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            source_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: translate('validations', 'required', {
                            ':attribute': 'Source Id',
                        }),
                    },
                },
            },
            source_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            data: {
                type: DataTypes.JSON,
            },
        },
        {
            sequelize,
            modelName: 'news',
            timestamps: true,
        }
    )

    return News
}
