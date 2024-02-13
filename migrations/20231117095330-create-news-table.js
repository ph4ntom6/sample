'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('news', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            source_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            source_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            data: {
                type: Sequelize.JSON,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('news')
    },
}
