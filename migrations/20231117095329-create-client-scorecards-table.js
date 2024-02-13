'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('client_scorecards', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            business_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            client_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            value: {
                type: Sequelize.JSON,
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
        await queryInterface.dropTable('client_scorecards')
    },
}
