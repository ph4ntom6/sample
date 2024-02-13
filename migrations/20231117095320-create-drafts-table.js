'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('drafts', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            bill_id: {
                type: Sequelize.STRING(19),
                allowNull: false,
            },
            business_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
            clients: {
                type: Sequelize.JSON,
            },
            stance: {
                type: Sequelize.ENUM(),
                values: ['support', 'oppose'],
            },
            talking_points: {
                type: Sequelize.JSON,
            },
            instructions: {
                type: Sequelize.TEXT,
            },
            send_to: {
                type: Sequelize.STRING(100),
            },
            writing_style: {
                type: Sequelize.JSON,
            },
            output: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('drafts')
    },
}
