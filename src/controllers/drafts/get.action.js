/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { Sequelize, col, literal } from 'sequelize'

import {
    BillModel,
    BillVersionModel,
    BusinessModel,
    DraftModel,
    UserModel,
} from '../../models'

/**  Filter Drafts
 * @description The function will return the list of drafts
 * @input billId, clientIds, stance
 * @return (Object)
 */
export const get = async (request, response) => {
    let {
        query: { bill_id, client_ids, stance, limit, page },
    } = request
    const conditions = []

    limit = parseInt(limit) > 0 ? parseInt(limit) : 10
    page = parseInt(page) > 0 ? parseInt(page) : 1
    const offset = (page - 1) * limit

    if (bill_id) {
        conditions.push({ bill_id: bill_id })
    }
    if (client_ids) {
        client_ids = client_ids.split(',')
        const clientIdsConditions = []
        client_ids.forEach((id) => {
            if (id && !isNaN(id)) {
                clientIdsConditions.push(
                    Sequelize.literal(
                        `JSON_CONTAINS(JSON_EXTRACT(drafts.clients, '$[*].id'), CAST(${id} AS JSON))`
                    )
                )
            }
        })
        conditions.push(Sequelize.or(...clientIdsConditions))
    }
    if (stance) {
        conditions.push({ stance })
    }

    const where = conditions.length > 0 ? Sequelize.and(...conditions) : {}

    const data = await DraftModel.findAll({
        where,
        include: [
            {
                model: BusinessModel,
                as: 'business',
                attributes: [],
            },
            {
                model: UserModel,
                as: 'user',
                attributes: [],
            },
            {
                model: BillModel,
                as: 'bills',
                attributes: [],
                include: [
                    {
                        model: BillVersionModel,
                        as: 'version',
                        attributes: [],
                    },
                ],
            },
        ],
        attributes: [
            'bill_id',
            'writing_style',
            'id',
            'clients',
            'created_at',
            'stance',
            'output',
            [col('bills.version.subject'), 'subject'],
            [col('bills.latest_bill_version_id'), 'bill_version_id'],
            [col('bills.version.version_num'), 'version_num'],
            [col('bills.bill_id'), 'bill_id'],
            [col('user.full_name'), 'full_name'],
            [
                literal(
                    'CONCAT(bills.measure_type, "-", bills.measure_num," ",subject)'
                ),
                'bill_title',
            ],
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']],
    })

    response.json({
        data,
    })
}
