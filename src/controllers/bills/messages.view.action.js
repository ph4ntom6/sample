import { ConversationMessageModel } from '../../models'

export const viewMessage = async (request, response) => {
    const {
        params: { messageId },
    } = request
    const data = await ConversationMessageModel.findOne({
        where: {
            id: messageId,
        },
        order: [['id', 'desc']],
    })

    return response.send({
        data,
    })
}
