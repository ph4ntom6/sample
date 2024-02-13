'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('alerts', 'is_read', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('alerts', 'is_read')
    },
}
