'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('bill_versions', 'code_interpreter', {
            type: Sequelize.STRING(10),
            defaultValue: 'False',
            allowNull: false,
        })
        await queryInterface.addColumn('bill_versions', 'assistant_id_code', {
            type: Sequelize.STRING(100),
            defaultValue: 'None',
            allowNull: false,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('bill_versions', 'code_interpreter')
        await queryInterface.removeColumn('bill_versions', 'assistant_id_code')
    },
}
