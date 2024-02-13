import translate from '../../helpers/translate'
import AppValidationError from '../../exceptions/AppValidationError'

import { UserModel } from '../../models'

export const validate = async (request, response) => {
    const { passwordToken } = request.params

    // fetch user from database
    const user = await UserModel.findOne({
        where: {
            password_token: passwordToken,
        },
    })

    // check if user is valid
    if (!user) {
        throw new AppValidationError(translate('errors', 'reset.expired'))
    }

    // check if user is not blocked
    if (user.status === 'blocked') {
        throw new AppValidationError(
            translate('errors', 'account_status.blocked')
        )
    }

    // send response
    return response.json({
        message: translate('messages', 'password_reset.valid'),
    })
}
