'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex(
            'bills',
            ['latest_bill_version_id', 'bill_num'],
            {
                name: 'bills_index',
            }
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('bills', 'bills_index')
    },
}
