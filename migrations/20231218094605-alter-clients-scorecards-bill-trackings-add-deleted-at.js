'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('clients', 'deleted_at', {
            type: Sequelize.DATE,
        })
        await queryInterface.addColumn('client_bill_tracking', 'deleted_at', {
            type: Sequelize.DATE,
        })
        await queryInterface.addColumn('client_scorecards', 'deleted_at', {
            type: Sequelize.DATE,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('clients', 'deleted_at')
        await queryInterface.removeColumn('client_bill_tracking', 'deleted_at')
        await queryInterface.removeColumn('client_scorecards', 'deleted_at')
    },
}
