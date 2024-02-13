'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('client_bill_impacts', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            client_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            bill_id: {
                type: Sequelize.STRING(19),
                allowNull: false,
            },
            bill_version_id: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            positive_impact_count: {
                type: Sequelize.INTEGER,
            },
            positive_impact_content: {
                type: Sequelize.TEXT,
            },
            negative_impact_count: {
                type: Sequelize.INTEGER,
            },
            negative_impact_content: {
                type: Sequelize.TEXT,
            },
            no_impact_count: {
                type: Sequelize.INTEGER,
            },
            no_impact_content: {
                type: Sequelize.TEXT,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('client_bill_impacts')
    },
}
