'use strict'
import data from './data/industries'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('industries', data, {
            ignoreDuplicates: true,
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('industries', null, {})
    },
}
