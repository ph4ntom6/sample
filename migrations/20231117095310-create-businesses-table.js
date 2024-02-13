'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('businesses', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            status: {
                type: Sequelize.ENUM,
                values: ['active', 'blocked'],
                defaultValue: 'active',
                allowNull: false,
            },
            contact_info: {
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
        await queryInterface.dropTable('businesses')
    },
}
