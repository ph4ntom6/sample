'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex(
            'clients',
            ['client_name', 'business_id', 'associate_id', 'industry_id'],
            {
                name: 'client_name',
                unique: true,
            }
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('clients', 'client_name')
    },
}
