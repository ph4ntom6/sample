import { col, Op } from 'sequelize'
import {
    BillModel,
    BillVersionModel,
    ClientModel,
    ClientBillTrackingModel,
} from '../../models'
import AppValidationError from '../../exceptions/AppValidationError'
import translate from '../../helpers/translate'

/**
 * @description  a function that will get all the client positions data
 * @param {id}
 * @query {page,limit}
 * @returns data
 */
export const getPosition = async (request, response) => {
    let {
        query: { page, limit },
        params: { id },
    } = request

    limit = parseInt(limit) > 0 ? parseInt(limit) : 10
    page = parseInt(page) > 0 ? parseInt(page) : 1
    const offset = (page - 1) * limit

    if (!request?.query?.orderBy) request.query.orderBy = 'id'
    if (!request?.query?.order) request.query.order = 'DESC'
    const order = [[request?.query?.orderBy, request?.query?.order]]

    /* If client is not found, throw a validation error */
    const client = await ClientModel.findByPk(id, {
        attributes: ['id'],
        raw: true,
    })

    if (!client) {
        throw new AppValidationError(
            translate('errors', 'notFound', {
                ':attribute': 'Client',
            }),
            404
        )
    }

    /* Get all the client positions data */
    const data = await ClientBillTrackingModel.findAll({
        where: {
            client_id: id,
            stance: { [Op.ne]: null },
        },
        include: [
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
            'id',
            'bill_id',
            'stance',
            'bill_version_id',
            'client_id',
            'updated_at',
            'bills.latest_bill_version_id',
            [col('bills.version.subject'), 'subject'],
            [col('bills.measure_num'), 'measure_num'],
            [col('bills.measure_type'), 'measure_type'],
            [col('bills.version.bill_version_action'), 'action'],
            [col('bills.version.bill_version_action_date'), 'action_date'],
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
