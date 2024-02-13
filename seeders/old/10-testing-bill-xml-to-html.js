import convertBillXmlToHtml from '../../src/helpers/bill-xml-to-html'
const { QueryTypes } = require('sequelize')

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const data = await queryInterface.sequelize.query(
            `SELECT bill_version_id, bill_xml FROM bill_versions WHERE bill_version_id = '20230AB192CHP' LIMIT 1`,
            {
                type: QueryTypes.SELECT,
                raw: true,
            }
        )

        for (let i = 0; i < data.length; i++) {
            await convertBillXmlToHtml(data[i].bill_xml)
            // eslint-disable-next-line
            console.log(i + 1, ':', data[i].bill_version_id)
        }
    },
    down: async (queryInterface, Sequelize) => {},
}
