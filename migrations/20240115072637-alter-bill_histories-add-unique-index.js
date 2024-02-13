'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('bill_histories', ['bill_history_id'], {
            name: 'bill_histories_unique',
            unique: true,
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex(
            'bill_histories',
            'bill_histories_unique'
        )
    },
}
