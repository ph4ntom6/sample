'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex(
            'client_bill_impacts',
            ['client_id', 'bill_id', 'bill_version_id'],
            {
                name: 'client_impacts',
                unique: true,
            }
        )
        await queryInterface.changeColumn('client_bill_impacts', 'bill_id', {
            type: Sequelize.STRING(100),
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex(
            'client_bill_impacts',
            'client_impacts'
        )
        await queryInterface.changeColumn('client_bill_impacts', 'bill_id', {
            type: Sequelize.STRING(19),
        })
    },
}
