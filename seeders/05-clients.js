'use strict'
import data from './data/clients'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('clients', data, {
            updateOnDuplicate: ['client_name'],
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('clients', null, {})
    },
}
