import bcrypt from 'bcrypt'

import { UserModel } from '../../models'

import translate from '../../helpers/translate'
import AppValidationError from '../../exceptions/AppValidationError'

export const changePassword = async (request, response) => {
    const { id } = request.user
    const { oldPassword, newPassword } = request.body

    const body = {}

    /* password validations */
    if (!bcrypt.compareSync(oldPassword, request.user.password)) {
        throw new AppValidationError(
            translate('validations', 'password.invalid', {
                ':field': 'old password',
            })
        )
    }

    /* create password hash */
    body.password = await bcrypt.hash(newPassword, 10)

    await UserModel.updateByPk(id, { body })

    /* send response*/
    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Your password has',
            ':action': 'updated',
        }),
    })
}
