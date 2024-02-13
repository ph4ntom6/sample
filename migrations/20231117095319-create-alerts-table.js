'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('alerts', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            bill_id: {
                type: Sequelize.STRING(19),
                allowNull: false,
            },
            business_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            bill_subject: {
                type: Sequelize.TEXT,
            },
            clients: {
                type: Sequelize.JSON,
            },
            details: {
                type: Sequelize.TEXT,
            },
            bill_status: {
                type: Sequelize.STRING(100),
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
        await queryInterface.dropTable('alerts')
    },
}
