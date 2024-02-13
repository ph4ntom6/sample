'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('client_bill_tracking', 'reasons', {
            type: Sequelize.JSON,
            allowNull: false,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('client_bill_tracking', 'reasons')
    },
}
