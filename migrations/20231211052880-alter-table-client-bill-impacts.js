'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('client_bill_impacts', 'deleted_at', {
            type: Sequelize.DATE,
        })
        await queryInterface.changeColumn(
            'client_bill_impacts',
            'positive_impact_content',
            {
                type: Sequelize.JSON,
            }
        )
        await queryInterface.changeColumn(
            'client_bill_impacts',
            'negative_impact_content',
            {
                type: Sequelize.JSON,
            }
        )
        await queryInterface.changeColumn(
            'client_bill_impacts',
            'no_impact_content',
            {
                type: Sequelize.JSON,
            }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('client_bill_impacts', 'deleted_at')
        await queryInterface.changeColumn(
            'client_bill_impacts',
            'positive_impact_content',
            {
                type: Sequelize.TEXT,
            }
        )
        await queryInterface.changeColumn(
            'client_bill_impacts',
            'negative_impact_content',
            {
                type: Sequelize.TEXT,
            }
        )
        await queryInterface.changeColumn(
            'client_bill_impacts',
            'no_impact_content',
            {
                type: Sequelize.TEXT,
            }
        )
    },
}
