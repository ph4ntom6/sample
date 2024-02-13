'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_codes', 'bill_version_id', {
            type: Sequelize.STRING(30),
            allowNull: false,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('bill_codes', 'bill_version_id')
    },
}
