/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { BillModel, BillVersionModel, ConversationModel } from '../../models'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

/**  View Conversation
 * @description The function will return a single conversation record
 * @input id: bill_id
 * @return (Array)
 */
export const viewConversation = async (request, response) => {
    const {
        user: { id: user_id },
        params: { id },
        query: { bill_version_id },
    } = request

    const where = {
        user_id,
        bill_id: id,
    }
    const billVersionWhere = {}

    if (bill_version_id) {
        billVersionWhere.bill_version_id = bill_version_id
    }

    const bill = await BillModel.findOne({
        where: {
            bill_id: id,
        },
        include: {
            model: BillVersionModel,
            as: 'version',
            where: billVersionWhere,
            attributes: ['bill_version_id'],
            required: false,
        },
        attributes: ['bill_id', 'latest_bill_version_id'],
    })

    if (!bill) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Bill',
            }),
            404
        )
    }

    where.bill_version_id =
        bill_version_id && bill?.version?.bill_version_id
            ? bill_version_id
            : bill?.latest_bill_version_id

    const data = await ConversationModel.findOne({
        where,
    })

    response.json({
        data,
    })
}
