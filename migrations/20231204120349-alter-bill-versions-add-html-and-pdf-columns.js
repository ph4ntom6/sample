'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_versions', 'summary', {
            type: Sequelize.TEXT,
        })
        await queryInterface.addColumn('bill_versions', 'impacts', {
            type: Sequelize.JSON,
        })
        await queryInterface.addColumn('bill_versions', 'bill_html', {
            type: Sequelize.TEXT('long'),
        })
        await queryInterface.addColumn('bill_versions', 'pdf_exists', {
            type: Sequelize.TINYINT,
            allowNull: false,
            defaultValue: false,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('bill_versions', 'summary')
        await queryInterface.removeColumn('bill_versions', 'impacts')
        await queryInterface.removeColumn('bill_versions', 'bill_html')
        await queryInterface.removeColumn('bill_versions', 'pdf_exists')
    },
}
