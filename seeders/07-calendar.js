'use strict'
import data from './data/calendar'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('calendar', data, {
            ignoreDuplicate: true,
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('calendar', null, {})
    },
}
