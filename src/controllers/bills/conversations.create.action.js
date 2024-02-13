import translate from '../../helpers/translate'
import createConversationHelper from '../../helpers/create-conversation'

/**
 * @description This function will create a conversation for selected bill
 * @param {*}
 * @returns (Object)
 */
export const createConversation = async (request, response) => {
    const {
        params: { id },
        user: { id: userId, business_id: businessId },
        body: { billVersionId },
    } = request

    await createConversationHelper({
        id,
        billVersionId,
        businessId,
        userId,
    })

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Conversation has',
            ':action': 'created',
        }),
    })
}
