'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_versions', 'response_time', {
            type: Sequelize.INTEGER.UNSIGNED,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('bill_versions', 'response_time')
    },
}
