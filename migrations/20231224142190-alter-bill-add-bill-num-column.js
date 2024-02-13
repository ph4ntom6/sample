'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bills', 'bill_num', {
            type: Sequelize.STRING(100),
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('bills', 'bill_num')
    },
}
