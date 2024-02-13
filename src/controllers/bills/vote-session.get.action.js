import { Op, col } from 'sequelize'

import { BillSummaryVoteModel, LocationCodeModel } from '../../models'

/** list Vote Summary
 * @description The function will return the list Vote Summary
 * @input id
 * @return (Object)
 */
export const getVoteSession = async (request, response) => {
    let {
        query: { keyword, page, limit },
        params: { id },
    } = request

    let where = {}

    /* Use the BillVersionModel to paginate and retrieve data */
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10
    page = parseInt(page) > 0 ? parseInt(page) : 1
    const offset = (page - 1) * limit
    if (!request?.query?.orderBy) request.query.orderBy = 'bill_id'
    if (!request?.query?.order) request.query.order = 'DESC'
    const order = [[request?.query?.orderBy, request?.query?.order]]

    keyword = keyword?.trim()
    if (keyword) {
        where = {
            [Op.or]: [
                {
                    vote_result: {
                        [Op.like]: `%${keyword}%`,
                    },
                },
                {
                    '$location_codes.description$': {
                        [Op.like]: `%${keyword}%`,
                    },
                },
            ],
        }
    }
    if (id) {
        where.bill_id = id
    }
    const data = await BillSummaryVoteModel.findAll({
        where,
        include: [
            {
                model: LocationCodeModel,
                attributes: [],
                as: 'location_codes',
            },
        ],
        attributes: [
            'bill_id',
            'location_code',
            'vote_date_time',
            'vote_date_seq',
            'motion_id',
            'vote_result',
            [col('location_codes.description'), 'session'],
        ],
        limit,
        offset,
        order,
        subQuery: false,
        raw: true,
    })
    response.json({
        data,
    })
}
