'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            "UPDATE bills SET bill_num = CASE WHEN session_num = 0 THEN CONCAT(measure_type, '-', measure_num) ELSE CONCAT(measure_type, 'X', session_num, '-', measure_num) END WHERE bill_num IS NULL;"
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            'UPDATE bills SET bill_num = null;'
        )
    },
}
