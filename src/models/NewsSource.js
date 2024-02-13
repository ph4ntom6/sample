import { AbstractModel } from './AbstractModel'

export default (sequelize, DataTypes) => {
    class NewsSource extends AbstractModel {
        static associate(models) {}
    }
    NewsSource.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(100),
            },
            feed_url: {
                type: DataTypes.STRING(500),
            },
            crawled_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            last_build_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'news_sources',
            timestamps: true,
        }
    )

    return NewsSource
}
