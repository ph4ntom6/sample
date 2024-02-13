/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { Op, col } from 'sequelize'
import {
    BillModel,
    AlertModel,
    UserBillTrackingModel,
    ReadAlertModel,
    ClientModel,
    ClientBillTrackingModel,
} from '../../models'

/**  Fetch Alert's List
 * @description The function will return the list of alerts
 * @input  status, clientIds
 * @return (Array)
 */
export const list = async (request, response) => {
    let {
        query: { status, client_ids, page, limit },
        user: { id, business_id },
    } = request

    limit = parseInt(limit) > 0 ? parseInt(limit) : 10
    page = parseInt(page) > 0 ? parseInt(page) : 1
    const offset = (page - 1) * limit

    if (!request?.query?.orderBy) request.query.orderBy = 'read_alert_id'
    if (!request?.query?.order) request.query.order = 'ASC'
    const order = [
        [request?.query?.orderBy, request?.query?.order],
        ['read_alert_id', 'asc'],
        // ['bill_id', request?.query?.order],
    ]

    let where = {}

    if (client_ids) {
        client_ids = client_ids?.split(',')
        client_ids = client_ids?.map((id) => parseInt(id))
        where = {
            ...where,
            '$bill.client_bill_trackings.client_id$': client_ids,
        }
    }

    if (status) {
        status = status?.split(',')
        where.bill_status = { [Op.in]: status }
    }

    const data = await AlertModel.findAll({
        where,
        attributes: [
            'id',
            'bill_id',
            'bill_subject',
            'details',
            'bill_status',
            'action_date',
            'clients',
            [col('read_alerts.id'), 'read_alert_id'],
        ],
        include: [
            {
                model: BillModel,
                as: 'bill',
                attributes: ['bill_num', 'latest_bill_version_id'],
                include: [
                    {
                        model: UserBillTrackingModel,
                        as: 'user_bill_trackings',
                        where: {
                            user_id: id,
                            business_id,
                        },
                        attributes: ['id'],
                        required: false,
                    },
                    {
                        model: ClientBillTrackingModel,
                        as: 'client_bill_trackings',
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: ClientModel,
                                as: 'bill_clients',
                                where: {
                                    business_id,
                                },
                                attributes: ['id', 'client_name'],
                            },
                        ],
                    },
                ],
            },
            {
                model: ReadAlertModel,
                where: {
                    user_id: id,
                },
                as: 'read_alerts',
                attributes: ['id'],
                required: false,
            },
        ],
        limit,
        offset,
        order,
        subQuery: false,
    })

    response.json({
        data,
    })
}
