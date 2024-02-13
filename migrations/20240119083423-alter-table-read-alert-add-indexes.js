'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('read_alerts', ['user_id', 'alert_id'], {
            name: 'read_alerts_unique_index',
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex(
            'read_alerts',
            'read_alerts_unique_index'
        )
    },
}
