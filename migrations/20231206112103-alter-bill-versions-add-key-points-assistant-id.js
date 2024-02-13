'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_versions', 'key_points', {
            type: Sequelize.JSON,
        })
        await queryInterface.addColumn('bill_versions', 'assistant_id', {
            type: Sequelize.STRING(100),
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('bill_versions', 'key_points')
        await queryInterface.removeColumn('bill_versions', 'assistant_id')
    },
}
