/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { Op, literal, col, fn } from 'sequelize'

import {
    BillModel,
    BillCodeModel,
    BillVersionModel,
    BillVersionAuthorModel,
} from '../../models'

/**  Fetch Bill's List
 * @description The function will return the list of bills
 * @input measureType, keyword, chamber, status, session, code
 * @return (Array)
 */
export const get = async (request, response) => {
    let {
        query: {
            keyword,
            measure_type,
            chamber,
            status,
            session,
            code,
            page,
            limit,
            paginate = true,
            bill_id,
            count = false,
        },
    } = request
    let where = {}

    limit = parseInt(limit) > 0 ? parseInt(limit) : 10
    page = parseInt(page) > 0 ? parseInt(page) : 1
    const offset = (page - 1) * limit

    let order = []
    if (!request?.query?.order) request.query.order = 'ASC'
    if (!request?.query?.orderBy || request?.query?.orderBy == 'bill_num') {
        order = [
            ['measure_type', request?.query?.order],
            ['measure_num', request?.query?.order],
            ['session_num', request?.query?.order],
        ]
    } else if (request?.query?.orderBy == 'trans_update') {
        order = [
            fn('isnull', col('bills.trans_update')),
            [request?.query?.orderBy, request?.query?.order],
        ]
    } else {
        order = [
            fn('isnull', col(request?.query?.orderBy)),
            [
                literal(`CAST(${request?.query?.orderBy} AS SIGNED)`),
                request?.query?.order,
            ],
            [request?.query?.orderBy, request?.query?.order],
        ]
    }

    const options = {
        group: ['bill_id'],
        order,
        subQuery: false,
        raw: true,
    }

    if (paginate === true || paginate === 'true') {
        options.limit = limit
        options.offset = offset
    }

    if (keyword?.trim()) {
        where = {
            [Op.or]: [
                literal(
                    'CONCAT(`bills`.`measure_type`, `bills`.`measure_num`) LIKE ' +
                        `'%${keyword}%'`
                ),
                literal(
                    "CONCAT(`bills`.`measure_type`, ' ', `bills`.`measure_num`) LIKE" +
                        `'%${keyword}%'`
                ),
                literal(
                    'LOWER(`bills`.`bill_num`) LIKE ' + `LOWER('%${keyword}%')`
                ),
                literal(
                    'LOWER(`authors`.`name`) LIKE ' + `LOWER('%${keyword}%')`
                ),
                literal(
                    'LOWER(`version`.`subject`) LIKE ' + `LOWER('%${keyword}%')`
                ),
            ],
        }
    }

    if (measure_type) {
        measure_type = measure_type?.split(',')
        where.measure_type = {
            [Op.in]: measure_type || [],
        }
    }

    if (chamber) {
        chamber = chamber?.split(',')
        where.current_house = {
            [Op.in]: chamber || [],
        }
    }

    if (status) {
        status = status?.split(',')
        where.current_status = {
            [Op.in]: status || [],
        }
    }

    if (session) {
        where.session_year = session?.replace(/[\s-]/g, '')
    }

    if (code) {
        code = code?.split(',')
        where['$bill_codes.code$'] = {
            [Op.in]: code || [],
        }
    }

    if (bill_id) {
        where.bill_id = bill_id
    }

    const data = await BillModel.findAll({
        where,
        include: [
            {
                model: BillVersionModel,
                as: 'version',
                attributes: [],
            },
            {
                model: BillVersionAuthorModel,
                as: 'authors',
                where: { primary_author_flg: 'Y' },
                attributes: [],
                required: false,
            },
            {
                model: BillCodeModel,
                as: 'bill_codes',
                attributes: [],
            },
        ],
        attributes: [
            'bill_id',
            'measure_type',
            'measure_num',
            'bill_num',
            'current_status',
            'trans_update',
            'latest_bill_version_id',
            [col('version.subject'), 'subject'],
            [literal('TRIM(version.subject)'), 'subject'],
            [literal('GROUP_CONCAT(DISTINCT `authors`.`name`)'), 'authors'],
            [literal('GROUP_CONCAT(DISTINCT `bill_codes`.`code`)'), 'codes'],
        ],
        ...options,
    })

    response.json({
        data: count ? data?.length : data,
    })
}
