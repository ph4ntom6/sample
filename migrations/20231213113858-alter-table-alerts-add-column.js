'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('alerts', 'bill_history_id', {
            type: Sequelize.DECIMAL(20, 0),
        })
        await queryInterface.addColumn('alerts', 'action_date', {
            type: Sequelize.DATE,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('alerts', 'bill_history_id')
        await queryInterface.removeColumn('alerts', 'action_date')
    },
}
