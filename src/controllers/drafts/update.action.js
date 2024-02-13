import { DraftModel } from '../../models'

import translate from '../../helpers/translate'

/* Update draft content
 * @description This method will update draft content
 * @input content
 * @return (Object)
 */
export const update = async (request, response) => {
    const {
        params: { id },
        body: { output },
    } = request

    await DraftModel.update({
        params: { id },
        body: {
            output,
        },
    })

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Draft content has',
            ':action': 'updated',
        }),
    })
}
