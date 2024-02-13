/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */

import { ClientBillTrackingModel } from '../../models'

/* Get single client impact of a bill
 * @description This method will fetch a single record of client
 * @input id (client id)
 * @return (Object)
 */
export const viewClientImpact = async (request, response) => {
    const {
        params: { id },
        query: { bill_id },
    } = request

    const data = await ClientBillTrackingModel.findOne({
        where: { client_id: id, bill_id },
    })

    /* send response */
    response.json({
        data,
    })
}
