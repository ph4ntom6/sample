import { v4 as uuidv4 } from 'uuid'
import { RoleModel, UserModel, BusinessModel } from '../../models'
import translate from '../../helpers/translate'
import sendEmail from '../../helpers/send-email'
import AppValidationError from '../../exceptions/AppValidationError'

/* Create new user
 * @description This method will create new user with required parameters
 * @input unique email with al required parameters
 * @return message
 */
export const create = async (request, response) => {
    const { body } = request

    const emailExists = await UserModel.findOne({
        where: {
            email: body?.email,
        },
        attributes: ['id'],
        raw: true,
    })
    if (emailExists) {
        /* send response if user already exist */
        throw new AppValidationError(translate('errors', 'account.emailExists'))
    }

    const role = await RoleModel.findByPk(body?.role_id, {
        attributes: ['id', 'title'],
    })

    if (!role) {
        /* send response if role exist */
        throw new AppValidationError(
            translate('errors', 'notFound', {
                ':attribute': `role`,
            }),
            404
        )
    }

    const business = await BusinessModel.findByPk(body?.business_id, {
        attributes: ['id', 'title'],
    })

    if (!business) {
        /* send response if business exist */
        throw new AppValidationError(
            translate('errors', 'notFound', {
                ':attribute': `business`,
            }),
            404
        )
    }

    const data = await UserModel.create({
        body: {
            email: body?.email,
            full_name: body?.full_name,
            role_id: role?.id,
            role_title: role?.title,
            business_id: business?.id,
            business_title: business?.title,
            passwordToken: uuidv4(),
            status: 'pending',
        },
    })
    // send reset password email to user
    if (data) {
        const link = `${process.env.APP_URL}password/set/${data?.passwordToken}/`
        try {
            await sendEmail('account-activation', data?.email, {
                '{{CUSTOMERNAME}}': `${data?.fullName}`,
                '{{LINK}}': link,
            })
        } catch (e) {
            // eslint-disable-next-line
            console.log('emails-not-working-locally')
        }
    }
    /* send success response*/
    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'User has',
            ':action': 'created',
        }),
    })
}
