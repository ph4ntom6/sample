import { isEqual, mapKeys, snakeCase, isEmpty } from 'lodash'
import Queue from 'bull'
import bullConfig from '../../config/bull'

import AppValidationError from '../../exceptions/AppValidationError'

import translate from '../../helpers/translate'

import { DraftModel, ClientModel, ClientBillImpactsModel } from '../../models'

const generateDraftQueue = new Queue('Generate Draft Queue', bullConfig)
const addBillClientsTracking = new Queue(
    'Add Bill Clients Tracking',
    bullConfig
)

/* Create or update draft
 * @description This method will create or update draft with required parameters
 * @input unique email with all required parameters
 * @return message
 */
export const create = async (request, response) => {
    const {
        body,
        user,
        params: { id },
    } = request

    let payload = {
        user_id: user?.id,
        business_id: user?.business_id,
    }
    let draft = null

    let updateClients = true
    let generateOutput = true
    let clientIds = []

    if (id) {
        draft = await DraftModel.findByPk(id, { raw: true })
        if (!draft) {
            throw new AppValidationError(
                translate('validations', 'notFound', {
                    ':attribute': 'Draft',
                }),
                404
            )
        }
        payload.id = draft?.id
        payload.bill_id = body?.bill_id ?? draft?.bill_id
        payload.stance = body?.stance ?? draft?.stance
        payload.send_to = body?.send_to ?? draft?.send_to
        payload.writing_style = body?.writing_style ?? draft?.writing_style
        payload.talking_points = body?.talking_points?.length
            ? body?.talking_points
            : draft?.talking_points
        payload.instructions = !isEmpty(body?.instructions)
            ? body?.instructions
            : draft?.instructions

        clientIds = draft?.clients?.map((client) => client?.id)
        updateClients = !isEqual(clientIds, body?.clients)
        if (!updateClients) {
            payload.clients = draft?.clients
        }
    } else {
        payload = {
            ...mapKeys(body, (value, key) => snakeCase(key)),
            ...payload,
        }
    }

    /*
     *  update client  tracking bill if it is not already tracked
     *  add bill in client model in tracking bill array
     *  add entry in client bill tracking model
     * */

    if (payload?.clients?.length) {
        // run queue here
        addBillClientsTracking.add({
            clientIds: payload?.clients,
            billId: payload?.bill_id,
            stance: payload?.stance,
        })
    }

    if (updateClients && body?.clients?.length) {
        const clients = await ClientModel.findAll({
            where: {
                id: body?.clients,
            },
            include: {
                model: ClientBillImpactsModel,
                as: 'client_impacts',
                where: { bill_id: payload?.bill_id },
                attributes: [
                    'positive_impact_content',
                    'negative_impact_content',
                ],
                required: false,
            },
            attributes: ['id', 'client_name', 'interests_goals'],
        })

        if (!clients?.length) {
            throw new AppValidationError(
                translate('validations', 'notFound', {
                    ':attribute': 'Clients',
                }),
                404
            )
        }

        /* map clients to store name */
        payload.clients = clients?.map((client) => {
            const clientImpacts = client?.client_impacts[0]
            return {
                id: client?.id,
                client_name: client?.client_name,
                interests_goals: client?.interests_goals,
                positive_impacts: clientImpacts?.positive_impact_content
                    ? JSON.parse(clientImpacts?.positive_impact_content)
                    : [],

                negative_impacts: clientImpacts?.negative_impact_content
                    ? JSON.parse(clientImpacts?.negative_impact_content)
                    : [],
            }
        })
    }

    if (id && draft && payload) {
        generateOutput = compareObjects(payload, draft)
    }

    let data
    if (payload) {
        if (generateOutput) {
            payload.is_processing = true
        }

        data = await DraftModel.upsert(payload, { returning: true, raw: true })
    }

    /* generate draft */
    if (generateOutput) {
        await generateDraftQueue.add(
            { payload, id: data[0]?.id },
            {
                delay: 5000,
                attempts: 3,
                backoff: 2000,
                removeOnComplete: true,
            }
        )
    }

    response.json({
        message: translate('messages', 'draft.success'),
        data: data ? data[0] : null,
    })
}

const compareObjects = (obj1, obj2) => {
    const commonKeys = Object.keys(obj1)

    /* check if the values are different for common keys */
    const areValuesDifferent = commonKeys.some((key) => {
        // Check if the values are arrays and perform a deep comparison
        if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
            return !obj1[key].every((elem, index) =>
                isEqual(elem, obj2[key][index])
            )
        }
        return !isEqual(obj1[key], obj2[key])
    })
    return areValuesDifferent
}
