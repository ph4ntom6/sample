import bcrypt from 'bcrypt'
import translate from '../../helpers/translate'
import generateToken from '../../helpers/generate-token'
import AppValidationError from '../../exceptions/AppValidationError'

import {
    UserModel,
    RoleModel,
    TokenModel,
    RefreshTokenModel,
} from '../../models'

export const set = async (request, response) => {
    const updatedBody = {}
    const { passwordToken } = request.params
    const { password, confirmPassword } = request.body
    let message = translate('messages', 'password_reset.reset')

    // validate the user input
    if (!password) {
        throw new AppValidationError(
            translate('validations', 'password.password')
        )
    } else if (password !== confirmPassword) {
        throw new AppValidationError(
            translate('validations', 'password.mismatch')
        )
    }

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

    // assign password
    updatedBody.password = await bcrypt.hash(password, 10)
    updatedBody.password_token = null

    // check and assign activatedAt and status accordingly
    if (!user.activated_at) {
        updatedBody.status = 'active'
        updatedBody.activated_at = new Date()
        message = translate('messages', 'password_reset.set')
    }

    // save user
    await UserModel.updateByPk(user.id, {
        body: updatedBody,
    })

    const role = await RoleModel.findByPk(user.role_id)

    /* generate token */
    const data = await generateToken(
        { TokenModel, RefreshTokenModel },
        user,
        role.scopes
    )

    /* send response */
    return response.json({
        message,
        data: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.tokenExpirationDate,
        },
    })
}
