/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import Queue from 'bull'
import bullConfig from '../../config/bull'

import translate from '../../helpers/translate'
import createConversation from '../../helpers/create-conversation'

import AppValidationError from '../../exceptions/AppValidationError'

import {
    BillModel,
    BillVersionModel,
    ConversationMessageModel,
    ConversationModel,
} from '../../models'

const messageQueue = new Queue('Message Queue', bullConfig)

/**
 * @description This function will create a message for selected conversation
 * @param {*}
 * @returns (Object)
 */
export const createMessage = async (request, response) => {
    let {
        user: { id: sender_id, full_name: sender_name, business_id },
        body: { message, conversation_id, bill_version_id },
        params: { id },
    } = request

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
            attributes: [
                'bill_version_id',
                'assistant_id_code',
                'version_num',
                'code_interpreter',
            ],
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

    let conversation = null

    if (!conversation_id) {
        /* create conversation */
        conversation = await createConversation({
            id,
            billVersionId: bill_version_id
                ? bill?.version?.bill_version_id
                : bill?.latest_bill_version_id,
            businessId: business_id,
            userId: sender_id,
        })
    } else {
        conversation = await ConversationModel.findOne({
            where: { id: conversation_id },
            attributes: ['id', 'assistant_id', 'thread_id'],
        })
    }

    conversation_id = conversation?.id

    const data = await ConversationMessageModel.createBulk(
        [
            {
                conversation_id: conversation_id,
                message,
                type: 'user',
                sender_id,
                sender_name,
            },
            {
                conversation_id: conversation_id,
                type: 'ai',
                sender_name: process.env.APP_NAME,
            },
        ],
        {
            returning: true,
        }
    )

    await messageQueue.add(
        { conversation, data, bill },
        {
            delay: 5000,
            attempts: 3,
            backoff: 2000,
            removeOnComplete: true,
        }
    )

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Message has',
            ':action': 'created',
        }),
        data,
    })
}
