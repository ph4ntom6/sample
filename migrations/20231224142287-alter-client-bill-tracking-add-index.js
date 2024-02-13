'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex(
            'client_bill_tracking',
            ['client_id', 'bill_id', 'keyword_track'],
            {
                name: 'client_bill',
                unique: true,
            }
        )
        await queryInterface.addColumn('client_bill_tracking', 'keywords', {
            type: Sequelize.JSON,
        })
        await queryInterface.changeColumn('client_bill_tracking', 'bill_id', {
            type: Sequelize.STRING(100),
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('client_bill_tracking', 'client_bill')
        await queryInterface.removeColumn('client_bill_tracking', 'keywords')
        await queryInterface.changeColumn('client_bill_tracking', 'bill_id', {
            type: Sequelize.STRING(19),
        })
    },
}
