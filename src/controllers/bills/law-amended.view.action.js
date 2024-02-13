/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { BillTodaysLawModel } from '../../models'

/** View Bill's law as of today
 * @description The function will return the bill
 * @input id
 * @return (Object)
 */
export const viewLawAmended = async (request, response) => {
    const {
        params: { id },
    } = request

    const data = await BillTodaysLawModel.findOne({
        where: { bill_id: id },
        attributes: ['bill_id', 'content', 'bill_version_id'],
    })

    response.json({
        data,
    })
}
