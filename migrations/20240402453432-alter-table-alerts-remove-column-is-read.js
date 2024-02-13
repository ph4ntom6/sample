'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('alerts', 'is_read')
        await queryInterface.changeColumn('alerts', 'user_id', {
            type: Sequelize.INTEGER.UNSIGNED,
        })
        await queryInterface.changeColumn('alerts', 'business_id', {
            type: Sequelize.INTEGER.UNSIGNED,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('alerts', 'is_read', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        })
        await queryInterface.changeColumn('alerts', 'user_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        })
        await queryInterface.changeColumn('alerts', 'business_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        })
    },
}
