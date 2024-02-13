/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { ClientBillImpactsModel, ClientModel } from '../../models'

/**  Clients Impacted List
 * @description The function will return the list of the Client which are Impacted when any
 * bill is updated
 * @input id, bill_version_id, client_id
 * @return (Array(Object))
 */
export const getImpactedClients = async (request, response) => {
    const {
        params: { id },
        query: { bill_version_id, client_id, for_dropdown = false },
    } = request

    const where = { bill_id: id }

    if (bill_version_id) {
        where.bill_version_id = bill_version_id
    }
    if (client_id) {
        where.client_id = client_id
    }

    request.query.attributes =
        request?.query?.attributes ??
        'client_id,bill_id,bill_version_id,positive_impact_count,positive_impact_content,negative_impact_count,negative_impact_content,no_impact_count,no_impact_content,is_processing'

    const data = await ClientBillImpactsModel.paginate(
        request,
        {
            where,
            include: {
                model: ClientModel,
                as: 'client',
                attributes: ['client_name'],
            },
        },
        null,
        !for_dropdown
    )

    response.json({
        data,
    })
}
