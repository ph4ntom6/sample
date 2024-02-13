import { BillVersionModel } from '../../models'

/** List Bill Version
 * @description The function will return the list of bill versions
 * @input id
 * @return (Object)
 */
export const getVersions = async (request, response) => {
    const {
        params: { id },
        query,
    } = request

    /* define 'where' object based on whether 'id' is present in the request */
    const where = { bill_id: id }

    /* Set default orderBy value if not provided in the query */
    if (!query.orderBy) query.orderBy = 'bill_version_action_date'
    if (!query.order) query.order = 'desc'

    /* Set default attributes if not provided in the query */
    query.attributes =
        query.attributes ||
        'bill_id,bill_version_id,bill_version_action_date,bill_version_action,bill_html'

    /* Use the BillVersionModel to paginate and retrieve data */
    const data = await BillVersionModel.paginate(request, {
        where,
    })

    response.json({
        data,
    })
}
