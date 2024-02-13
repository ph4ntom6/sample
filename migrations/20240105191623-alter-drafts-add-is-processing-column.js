'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('drafts', 'is_processing', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('drafts', 'is_processing')
    },
}
