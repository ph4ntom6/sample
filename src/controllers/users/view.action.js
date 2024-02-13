import { omit } from 'lodash'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

import { UserModel } from '../../models'

/* Get Single User
 * @description This method will get a user
 * @input user Id
 * @return (Object)
 */
export const view = async (request, response) => {
    const {
        params: { id },
        user,
    } = request

    const where = {}

    let data = await UserModel.findByPk(id || user?.id, {
        where,
        raw: true,
    })

    /* return error if user is not found */
    if (!data) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'User',
            }),
            404
        )
    }

    if (
        data?.role_title === 'Platform Owner' &&
        user?.role_title !== 'Platform Owner'
    ) {
        return response.status(403).send('Forbidden')
    }

    if (
        data?.role_title === 'Admin' &&
        data?.business_id !== user?.business_id
    ) {
        return response.status(403).send('Forbidden')
    }

    const removeFields = ['verification_code', 'password_token', 'password']

    /* remove specific fields */
    data = omit(JSON.parse(JSON.stringify(data)), removeFields)

    /* send response */
    return response.json({
        data,
    })
}
