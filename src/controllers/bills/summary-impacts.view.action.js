/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { col } from 'sequelize'
import { BillHistoryModel, BillModel, BillVersionModel } from '../../models'

/**  Fetch bill's summary, key points and impacts
 * @description The function will return bill's summary, key points and impacts of given bill id
 * @input bill id, bill version id
 * @return (Object)
 */
export const viewSummaryImpacts = async (request, response) => {
    const {
        params: { id },
        query: { getHistory = false },
    } = request

    // const billVersionWhere = {
    //     pdf_exists: true,
    // }
    // if (bill_version_id) {
    //     billVersionWhere.bill_version_id = bill_version_id
    // }

    // const data = await BillVersionModel.findOne({
    //     where: {
    //         bill_id: id,
    //         bill_version_id,
    //         pdf_exists: true,
    //     },
    //     attributes: [
    //         'summary',
    //         'impacts',
    //         'key_points',
    //         'bill_version_id',
    //         'version_num',
    //     ],
    // })

    const data = await BillModel.findOne({
        where: {
            bill_id: id,
        },
        include: [
            {
                model: BillVersionModel,
                as: 'version',
                // where: billVersionWhere,
                attributes: [],
            },
        ],
        attributes: [
            'bill_num',
            [col('version.summary'), 'summary'],
            [col('version.impacts'), 'impacts'],
            [col('version.bill_version_id'), 'bill_version_id'],
            [col('version.version_num'), 'version_num'],
            [col('version.subject'), 'subject'],
            // [col('version.assistant_id'), 'assistant_id'],
            [col('version.key_points'), 'key_points'],
        ],
        raw: true,
    })

    if (getHistory) {
        const history = await BillHistoryModel.findOne({
            where: { bill_id: id },
            order: [['action_date', 'DESC']],
            attributes: ['action', 'action_date'],
        })

        if (history) {
            data.latest_version = history?.action
            data.latest_version_action_date = history?.action_date
        }
    }

    response.json({ data })
}
