'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex(
            'user_bill_tracking',
            ['user_id', 'business_id', 'bill_id'],
            {
                name: 'user_bill_tracking_unique_index',
            }
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex(
            'user_bill_tracking',
            'user_bill_tracking_unique_index'
        )
    },
}
