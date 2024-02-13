/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { BillModel, ClientBillTrackingModel } from '../../models'

import translate from '../../helpers/translate'

/**
 * @description a function that will update stance position
 * @param {*}
 * @returns data
 */
export const updatePosition = async (request, response) => {
    const {
        body,
        params: { id },
    } = request
    const bill = await BillModel.findOne({
        where: {
            bill_id: body?.bill_id,
        },
        attributes: ['bill_id', 'latest_bill_version_id'],
    })
    if (!bill) {
        response.status(404).json({
            message: translate('errors', 'notFound', {
                ':attribute': 'Bill ',
            }),
        })
    }

    /* update the ClientBillTrackingModel with the provided parameters and body */
    await ClientBillTrackingModel.upsert({
        client_id: id,
        stance: body?.stance,
        bill_id: body?.bill_id,
        reasons: body?.reasons,
        bill_version_id: bill?.latest_bill_version_id,
    })

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Position has',
            ':action': 'added',
        }),
    })
}
