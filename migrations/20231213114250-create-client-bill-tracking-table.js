'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('client_bill_tracking', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            client_id: {
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
            stance: {
                type: Sequelize.ENUM(),
                values: ['support', 'oppose', 'neutral'],
            },
            keyword_track: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('client_bill_tracking')
    },
}
