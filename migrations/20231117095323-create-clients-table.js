'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('clients', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            client_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            business_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            associate_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            industry_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            industry_title: {
                type: Sequelize.STRING(100),
            },
            status: {
                type: Sequelize.ENUM(),
                values: ['active', 'in-active'],
                defaultValue: 'active',
                allowNull: false,
            },
            short_bio: {
                type: Sequelize.TEXT,
            },
            cp_name: {
                type: Sequelize.STRING(100),
            },
            cp_email: {
                type: Sequelize.STRING(100),
            },
            cp_phone: {
                type: Sequelize.STRING(100),
            },
            cp_address: {
                type: Sequelize.STRING(100),
            },
            interests_goals: {
                type: Sequelize.JSON,
            },
            tracking_bills: {
                type: Sequelize.JSON,
            },
            tracking_keywords: {
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
        await queryInterface.dropTable('clients')
    },
}
