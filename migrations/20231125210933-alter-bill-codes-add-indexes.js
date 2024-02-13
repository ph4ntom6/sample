'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('bill_codes', {
            name: 'bill_code',
            fields: ['code', 'bill_id'],
            unique: true,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('bill_codes', {
            name: 'bill_code',
            fields: ['code', 'bill_id'],
        })
    },
}
