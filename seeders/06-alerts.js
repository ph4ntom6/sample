'use strict'
import data from './data/alerts'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('alerts', data, {
            ignoreDuplicate: true,
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('alerts', null, {})
    },
}
