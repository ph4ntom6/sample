'use strict'
import data from './data/news-source'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('news_sources', null, {})

        await queryInterface.bulkInsert('news_sources', data, {
            ignoreDuplicate: true,
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('news_sources', null, {})
    },
}
