'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('conversations', {
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
        await queryInterface.dropTable('conversations')
    },
}
