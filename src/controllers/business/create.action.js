import { BusinessModel } from '../../models'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

/**
 * @description a function that will create/update business data
 * @param {*}
 * @returns data
 */
export const create = async (request, response) => {
    const {
        params: { id },
        body,
    } = request

    const payload = {
        title: body?.title,
        description: body?.description,
        status: body?.status,
        contact_info: body?.contact_info,
    }

    if (id) {
        payload.id = id
        const business = await BusinessModel.findByPk(id, { raw: true })
        if (!business) {
            throw new AppValidationError(
                translate('validations', 'notFound', {
                    ':attribute': 'Business',
                }),
                404
            )
        }
    }

    await BusinessModel.upsert(payload)

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Business has',
            ':action': id ? 'updated' : 'created',
        }),
    })
}
