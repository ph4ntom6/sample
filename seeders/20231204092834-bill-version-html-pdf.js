'use strict'
import Queue from 'bull'
import bullConfig from '../src/config/bull'

const FetchBillVersionQueue = new Queue('Fetch Bill Version', bullConfig)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await FetchBillVersionQueue.add()
    },

    async down(queryInterface, Sequelize) {},
}
