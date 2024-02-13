import { ReadAlertModel } from '../../models'
import translate from '../../helpers/translate'

/**
 * @description The function will mark alert as read
 * @input  id
 * @return (Array)
 */
export const markAsRead = async (request, response) => {
    const {
        params: { id },
        user,
    } = request

    await ReadAlertModel.create({
        body: {
            alert_id: id,
            user_id: user?.id,
            business_id: user?.business_id,
        },
    })

    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Alert has',
            ':action': 'marked as read',
        }),
    })
}
