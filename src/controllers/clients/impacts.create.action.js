/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import Queue from 'bull'

import bullConfig from '../../config/bull'
import AppValidationError from '../../exceptions/AppValidationError'

import { BillModel, ClientBillImpactsModel, ClientModel } from '../../models'
import translate from '../../helpers/translate'

/* Creat impacts of single client
 * @description This method will generate client impacts
 * @input id, billId
 * @return String
 */

const AddClientImpactsQueue = new Queue('Add Client Impacts', bullConfig)

export const createClientImpacts = async (request, response) => {
    const {
        body: { client_id },
        query: { bill_id },
    } = request

    const client = await ClientModel.findByPk(client_id, {
        attributes: ['id', 'client_name', 'interests_goals'],
        raw: true,
    })

    /* return error if client is not found */
    if (!client) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Client',
            }),
            404
        )
    }

    const bill = await BillModel.findByPk(bill_id, {
        attributes: ['bill_id', 'latest_bill_version_id'],
        raw: true,
    })

    if (!bill) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Bill',
            }),
            404
        )
    }
    let impact = await ClientBillImpactsModel.findOne({
        where: {
            bill_id: bill?.bill_id,
            bill_version_id: bill?.latest_bill_version_id,
            client_id,
        },
        attributes: ['id'],
        raw: true,
    })

    if (!client?.interests_goals?.length) {
        throw new AppValidationError(
            translate('errors', 'impacts.noInterestAndGoals'),
            422
        )
    }

    // if (!impact?.id) {
    impact = await ClientBillImpactsModel.upsert({
        id: impact?.id ?? null,
        bill_id: bill?.bill_id,
        bill_version_id: bill?.latest_bill_version_id,
        client_id,
        is_processing: true,
    })

    if (impact[0]?.id) {
        await AddClientImpactsQueue.add({
            goals: client?.interests_goals,
            clientId: client?.id,
            clientName: client?.client_name,
            billId: bill?.bill_id,
            billVersionId: bill?.latest_bill_version_id,
            clientImpactId: impact?.id,
        })
    }
    // }
    /* send response */
    response.json({
        message: translate('messages', 'clients.impactsView'),
        data: {
            client_id,
        },
    })
}
