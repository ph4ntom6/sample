import translate from '../../helpers/translate'

import { DraftModel } from '../../models'

/**  Remove Draft
 * @description The function will delete the draft
 * @input id
 * @return (Object)
 */
export const remove = async (request, response) => {
    const {
        params: { id },
    } = request

    await DraftModel.destroy({ where: { id } })

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Draft has',
            ':action': 'deleted',
        }),
    })
}
