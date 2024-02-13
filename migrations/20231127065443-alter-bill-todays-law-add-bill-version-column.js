'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_todays_laws', 'bill_version_id', {
            type: Sequelize.STRING(30),
            allowNull: false,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('bill_todays_laws', 'bill_version_id')
    },
}
