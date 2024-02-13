'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('bill_histories', 'alerts_exist', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('bill_histories', 'alerts_exist', {
            type: Sequelize.BOOLEAN,
        })
    },
}
