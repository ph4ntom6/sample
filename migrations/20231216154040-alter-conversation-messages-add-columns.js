'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('conversation_messages', 'sender_id', {
            type: Sequelize.INTEGER.UNSIGNED,
        })
        await queryInterface.addColumn('conversation_messages', 'sender_name', {
            type: Sequelize.STRING(255),
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('conversation_messages', 'sender_id')
        await queryInterface.removeColumn(
            'conversation_messages',
            'sender_name'
        )
    },
}
