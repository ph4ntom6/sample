'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'conversation_messages',
            'response_time',
            {
                type: Sequelize.INTEGER.UNSIGNED,
            }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'conversation_messages',
            'response_time'
        )
    },
}
