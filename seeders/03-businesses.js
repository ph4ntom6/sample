'use strict'
import data from './data/businesses'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('businesses', data, {
            updateOnDuplicate: ['title'],
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('businesses', null, {})
    },
}
