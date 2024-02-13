import { Op } from 'sequelize'

import { UserModel } from '../../models'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

/* Update user
 * @description This method will update user
 * @input user details to be updated
 * @return (Object)
 */
export const update = async (request, response) => {
    const { user, body, params } = request
    const updatedBody = {}
    const id = params?.id || user?.id

    const where = {}

    const data = await UserModel.findByPk(id, {
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

    if (body?.full_name) {
        updatedBody.full_name = body?.full_name
    }
    if (body?.status) {
        updatedBody.status = body?.status
    }
    if (body?.email) {
        updatedBody.email = body?.email

        const existsEmail = await UserModel.findOne({
            where: {
                id: { [Op.ne]: id },
                email: body?.email,
            },
            attributes: ['id'],
            raw: true,
        })

        if (existsEmail) {
            throw new AppValidationError(
                translate('errors', 'account.emailExists')
            )
        }
    }

    if (updatedBody) {
        await UserModel.updateByPk(id, {
            body: updatedBody,
        })
    }

    /* send response*/
    return response.json({
        message: translate('messages', 'success', {
            ':attribute': `${params?.id ? 'User' : 'Your'} profile has`,
            ':action': 'updated',
        }),
    })
}
