'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_bill_tracking', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            business_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            bill_id: {
                type: Sequelize.STRING(19),
                allowNull: false,
            },
            bill_version_id: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            deleted_at: {
                type: Sequelize.DATE,
            },
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_bill_tracking')
    },
}
