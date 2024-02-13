import {
    BillModel,
    BillVersionModel,
    ClientBillTrackingModel,
    ClientModel,
    ClientScorecardModel,
} from '../../models'

import { Op } from 'sequelize'
import { sortBy, replace } from 'lodash'
// eslint-disable-next-line import/no-extraneous-dependencies
import { HTMLToJSON } from 'html-to-json-parser'

import translate from '../../helpers/translate'
import AppValidationError from '../../exceptions/AppValidationError'
import generateScorecardHtml from '../../helpers/generate-scorecard-html'

/**
 * @description  a function that will create client score card data
 * @param {*}
 * @returns message
 */
export const createScorecard = async (request, response) => {
    const {
        params: { id },
    } = request

    /* If client is not found, throw a validation error */
    const client = await ClientModel.findByPk(id, {
        attributes: ['id', 'client_name', 'business_id'],
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

    await ClientScorecardModel.destroy({
        where: {
            client_id: id,
        },
    })

    let billTracking = await ClientBillTrackingModel.findAll({
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
            'stance',
            'bills.current_status',
            'bills.version.subject',
            'bills.version.summary',
            'bills.measure_num',
            'bills.measure_type',
        ],
        raw: true,
    })

    if (!billTracking?.length) {
        throw new AppValidationError(
            translate('messages', 'clients.billNotFound'),
            422
        )
    }

    billTracking = sortBy(billTracking, 'stance')

    let html = '<div></div>'

    html = generateScorecardHtml(billTracking, client?.client_name)
    const json = await HTMLToJSON(html, true)
    const data = await ClientScorecardModel.create({
        body: {
            value: json,
            client_id: id,
            business_id: client?.business_id,
        },
    })
    data.value = replace(html, /\\n/g, '')
    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Client score card has',
            ':action': 'created',
        }),
        data,
    })
}
