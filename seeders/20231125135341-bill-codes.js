'use strict'
import Queue from 'bull'
import bullConfig from '../src/config/bull'

const UpdateBillCodesQueue = new Queue('Update Bill Codes', bullConfig)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await UpdateBillCodesQueue.add()
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('bill_codes', null, {})
    },
}
