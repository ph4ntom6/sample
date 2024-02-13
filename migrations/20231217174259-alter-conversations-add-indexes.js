'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('conversations', {
            name: 'bill_conversation',
            fields: ['bill_id', 'bill_version_id', 'user_id'],
            unique: true,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('conversations', {
            name: 'bill_conversation',
            fields: ['bill_id', 'bill_version_id', 'user_id'],
        })
    },
}
