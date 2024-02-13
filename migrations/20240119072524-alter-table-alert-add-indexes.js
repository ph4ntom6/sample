'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex(
            'alerts',
            ['bill_status', 'bill_id', 'action_date'],
            {
                name: 'alerts_composite_index',
            }
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('alerts', 'alerts_composite_index')
    },
}
