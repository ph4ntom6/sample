import { Op } from 'sequelize'
import {
    BillModel,
    BillVersionModel,
    ClientModel,
    ClientBillTrackingModel,
} from '../../models'
import AppValidationError from '../../exceptions/AppValidationError'
import translate from '../../helpers/translate'

/**
 * @description  a function that will get all the client bills without stance
 * @param {id}
 * @query {page,limit}
 * @returns data
 */
export const getClientBills = async (request, response) => {
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
            stance: { [Op.eq]: null },
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
        attributes: ['id', 'bill_id', 'bill_version_id'],
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
