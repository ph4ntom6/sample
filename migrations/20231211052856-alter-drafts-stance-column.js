'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('drafts', 'stance', {
            type: Sequelize.ENUM,
            values: [
                'support',
                'oppose',
                'request-for-signature',
                'request-for-veto',
            ],
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('drafts', 'stance', {
            type: Sequelize.ENUM,
            values: ['support', 'oppose'],
        })
    },
}
