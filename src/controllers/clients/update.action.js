import { difference, isArray, isEqual, sortBy } from 'lodash'

import { ClientModel, IndustryModel } from '../../models'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

import Queue from 'bull'
import bullConfig from '../../config/bull'

const GenerateMultipleBillClientImpactsQueue = new Queue(
    'Generate Multiple Bill Client Impacts',
    bullConfig
)
const DeleteClientImapctsQueue = new Queue('Delete Client Impacts', bullConfig)

/**
 * @description a function that will update client data
 * @param {id}
 * @returns data
 */
export const update = async (request, response) => {
    const {
        body,
        params: { id },
    } = request
    if (isArray(body?.interests_goals) && !body?.interests_goals?.length) {
        body.interests_goals = null
    }

    let newKeywords = []
    let newTrackedBillIds = []
    let goalsUpdated = false

    const client = await ClientModel.findByPk(id, {
        attributes: [
            'id',
            'client_name',
            'interests_goals',
            'tracking_bills',
            'tracking_keywords',
        ],
    })

    if (!client) {
        throw new AppValidationError(
            translate('errors', 'notFound', {
                ':attribute': 'Client',
            }),
            404
        )
    }

    if (body?.industry_id) {
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
        body.industry_title = industry?.title
    }

    if (
        body?.interests_goals?.length &&
        !isEqual(sortBy(body?.interests_goals), sortBy(client?.interests_goals))
    ) {
        goalsUpdated = true
    }

    if (isArray(body?.tracking_bills) || isArray(body?.tracking_keywords)) {
        /* deleted bills */
        const deletedBillIds = difference(
            client?.tracking_bills,
            body?.tracking_bills
        )

        /* deleted kewyords */
        const deletedKeywords = difference(
            client?.tracking_keywords,
            body?.tracking_keywords
        )

        if (deletedBillIds?.length || deletedKeywords?.length) {
            await DeleteClientImapctsQueue.add({
                clientId: id,
                deletedBillIds,
                deletedKeywords,
            })
        }

        /* check for new tracking bills*/
        newTrackedBillIds = difference(
            body?.tracking_bills,
            client?.tracking_bills
        )
        /* check for new tracking keywords*/
        newKeywords = difference(
            body?.tracking_keywords,
            client?.tracking_keywords
        )

        /*
            if tracking bills given then make it unique and then assign
            body.tracking_bills otherwise assign already existed tracking bills
        */
        body.tracking_bills = isArray(body?.tracking_bills)
            ? [...new Set(body?.tracking_bills)]
            : client?.tracking_bills

        /* same for keywords */
        body.tracking_keywords = isArray(body?.tracking_keywords)
            ? [...new Set(body?.tracking_keywords)]
            : client?.tracking_keywords
    }

    /* tracking_keywords is given and empty then assign null */
    if (isArray(body?.tracking_keywords) && !body?.tracking_keywords?.length) {
        body.tracking_keywords = null
    }
    /* tracking_bills is given and empty then assign null */
    if (isArray(body?.tracking_bills) && !body?.tracking_bills?.length) {
        body.tracking_bills = null
    }

    await ClientModel.update({
        params: {
            id,
        },
        body,
    })

    if (
        (isArray(body?.tracking_bills) && body?.tracking_bills?.length) ||
        (isArray(body?.tracking_keywords) && body?.tracking_keywords?.length)
    ) {
        await GenerateMultipleBillClientImpactsQueue.add({
            goalsUpdated,
            clientId: client?.id,
            goals: body?.interests_goals,
            clientName: client?.client_name,
            trackingBillIds: newTrackedBillIds?.length ? newTrackedBillIds : [],
            trackingKeywords: newKeywords?.length ? newKeywords : [],
        })
    }

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Client has',
            ':action': 'updated',
        }),
    })
}
