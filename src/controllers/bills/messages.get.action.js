/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { ConversationMessageModel } from '../../models'

/**  Fetch Messages List
 * @description The function will return the list of messages of a conversation
 * @input id: conversationId
 * @return (Array)
 */
export const getMessages = async (request, response) => {
    const {
        query: { conversation_id },
    } = request

    request.query.orderBy = 'id'
    request.query.order = 'desc'
    const data = await ConversationMessageModel.paginate(request, {
        where: { conversation_id: parseInt(conversation_id) },
    })

    response.json({
        data,
    })
}
