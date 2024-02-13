'use strict'
import Queue from 'bull'
import bullConfig from '../src/config/bull'

const AddBillAsLawOfTodayQueue = new Queue(
    'Add Bill As Law Of Today',
    bullConfig
)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await AddBillAsLawOfTodayQueue.add()
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('bill_todays_laws', null, {})
    },
}
