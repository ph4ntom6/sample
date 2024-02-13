'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('bill_todays_laws', {
            name: 'bill_todays_law',
            fields: ['bill_id'],
            unique: true,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('bill_todays_laws', {
            name: 'bill_todays_law',
            fields: ['bill_id'],
        })
    },
}
