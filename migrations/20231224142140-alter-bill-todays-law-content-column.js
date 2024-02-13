'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('bill_todays_laws', 'content', {
            type: Sequelize.TEXT('long'),
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('bill_todays_laws', 'content', {
            type: Sequelize.TEXT,
        })
    },
}
