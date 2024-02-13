'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('conversation_messages', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            conversation_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM(),
                values: ['user', 'ai'],
            },
            value: {
                type: Sequelize.INTEGER,
            },
            message: {
                type: Sequelize.TEXT,
            },
            source: {
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
        await queryInterface.dropTable('conversation_messages')
    },
}
