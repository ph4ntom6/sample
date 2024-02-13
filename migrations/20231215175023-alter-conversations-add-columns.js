'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('conversations', 'bill_version_id', {
            type: Sequelize.STRING(30),
            allowNull: false,
        })
        await queryInterface.addColumn('conversations', 'thread_id', {
            type: Sequelize.STRING(100),
        })
        await queryInterface.addColumn('conversations', 'assistant_id', {
            type: Sequelize.STRING(100),
            allowNull: false,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('conversations', 'bill_version_id')
        await queryInterface.removeColumn('conversations', 'thread_id')
        await queryInterface.removeColumn('conversations', 'assistant_id')
    },
}
