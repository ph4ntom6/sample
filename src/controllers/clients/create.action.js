import Queue from 'bull'
import bullConfig from '../../config/bull'

import { ClientModel, IndustryModel } from '../../models'

import { isArray } from 'lodash'

import translate from '../../helpers/translate'
import AppValidationError from '../../exceptions/AppValidationError'

/**
 * @description  a function that will create/update client data
 * @param {*}
 * @returns data
 */

const GenerateMultipleBillClientImpactsQueue = new Queue(
    'Generate Multiple Bill Client Impacts',
    bullConfig
)

export const create = async (request, response) => {
    let { user, body } = request

    const industry = await IndustryModel.findByPk(body?.industry_id, {
        attributes: ['id', 'title'],
    })

    /* return error if industry is not found */
    if (!industry) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Industry',
            }),
            404
        )
    }

    body = {
        ...body,
        industry_title: industry?.title,
        business_id: user?.business_id,
        associate_id: user?.id,
    }

    const client = await ClientModel.create({ body })

    if (client?.id) {
        /* if client bill tracking exist then add a queue job to insert
           it into client bill tracking and also generate respective impacts */

        /* if client bill keywords exist then add a queue job to fetch
           respective bills , insert it into client bill tracking and also 
           generate respective impacts */
        if (
            (isArray(body?.tracking_bills) && body?.tracking_bills?.length) ||
            (isArray(body?.tracking_keywords) &&
                body?.tracking_keywords?.length)
        ) {
            await GenerateMultipleBillClientImpactsQueue.add({
                clientId: client?.id,
                clientName: client?.client_name,
                trackingBillIds: body?.tracking_bills,
                trackingKeywords: body?.tracking_keywords,
                goals: body?.interests_goals,
            })
        }
    }
    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Client has',
            ':action': 'created',
        }),
    })
}
