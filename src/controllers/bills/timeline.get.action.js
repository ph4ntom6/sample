import { BillHistoryModel } from '../../models'

/**  Fetch bill timeline List
 * @description The function will return the list of bill timeline
 * @input id
 * @return (Object)
 */

export const getBillTimeline = async (request, response) => {
    const {
        params: { id },
        query,
    } = request

    const where = { bill_id: id }

    /* Set default orderBy value if not provided in the query */
    if (!query?.orderBy) query.orderBy = 'action_date'
    if (!query?.order) query.order = 'DESC'

    /* Set default attributes if not provided in the query */
    query.attributes = query.attributes || 'bill_id,action,action_date'

    /* Use the BillHistoryModel to paginate and retrieve data */
    const data = await BillHistoryModel.paginate(request, {
        where,
    })

    response.json({
        data,
    })
}
