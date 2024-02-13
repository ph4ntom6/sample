import { v4 as uuidv4 } from 'uuid'

import translate from '../../helpers/translate'
import sendEmail from '../../helpers/send-email'
import AppValidationError from '../../exceptions/AppValidationError'

import { UserModel } from '../../models'

export const request = async (request, response) => {
    const { email } = request.body

    // fetch user from database
    let user = await UserModel.findOne({
        where: {
            email,
        },
        raw: true,
    })

    if (!user) {
        throw new AppValidationError(translate('errors', 'reset.invalid'))
    }

    // check if user is not blocked
    if (user.status === 'blocked') {
        throw new AppValidationError(translate('errors', 'account.blocked'))
    }

    // generate and assign password token
    user = await UserModel.updateByPk(user.id, {
        body: { password_token: uuidv4() },
    })

    const link = `${process.env.APP_URL}password/${user.password_token}/`

    // send reset password email to user
    try {
        await sendEmail('reset-password', user.email, {
            '{{LINK}}': link,
        })
    } catch (error) {
        // eslint-disable-next-line
        console.log('Email not working locally')
    }

    // send response
    return response.send({
        message: translate('messages', 'password_reset.success'),
    })
}
