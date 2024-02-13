'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('client_bill_impacts', 'response_time', {
            type: Sequelize.INTEGER.UNSIGNED,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'client_bill_impacts',
            'response_time'
        )
    },
}
