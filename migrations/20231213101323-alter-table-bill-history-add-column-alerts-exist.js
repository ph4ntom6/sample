'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_histories', 'alerts_exist', {
            type: Sequelize.BOOLEAN,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('bill_histories', 'alerts_exist')
    },
}
