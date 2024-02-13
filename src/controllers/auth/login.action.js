import {
    RoleModel,
    UserModel,
    TokenModel,
    RefreshTokenModel,
} from '../../models'

import bcrypt from 'bcrypt'
import translate from '../../helpers/translate'
import generateToken from '../../helpers/generate-token'

export const login = async (request, response) => {
    const { email, password, remember } = request.body
    /* find user by email */
    const user = await UserModel.findOne({
        where: {
            email,
        },
        attributes: ['id', 'status', 'role_id', 'password'],
    })

    /* check if user is valid */
    if (user) {
        if (user.status === 'blocked') {
            /* send response if the user is blocked */
            return response.status(423).json({
                message: translate('errors', 'account.blocked'),
            })
        } else if (
            /* check password for the user */
            user.password &&
            bcrypt.compareSync(password.toString(), user.password)
        ) {
            if (user.status === 'active') {
                const role = await RoleModel.findByPk(user.role_id, {
                    attributes: ['scopes'],
                })

                if (role) {
                    /* generate tokens */
                    const data = await generateToken(
                        { TokenModel, RefreshTokenModel },
                        user,
                        role.scopes,
                        remember
                    )

                    const responseData = {
                        message: translate('messages', 'login.successful'),
                        data: {
                            accessToken: data.accessToken,
                            refreshToken: data.refreshToken,
                            expiresIn: data.tokenExpirationDate,
                        },
                    }

                    /* send response */
                    return response.json(responseData)
                }
            } else {
                /* send response if the user is pending or not activated */
                return response.status(410).json({
                    message: translate('errors', 'account.pending'),
                })
            }
        }
    }

    /* send response if the it is still not sent */
    return response.status(404).json({
        message: translate('errors', 'credentials.invalid'),
    })
}
