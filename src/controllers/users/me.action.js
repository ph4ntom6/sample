import { omit } from 'lodash'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

import { BusinessModel, UserModel } from '../../models'

/* Get Single User
 * @description This method will get a user
 * @input user Id
 * @return (Object)
 */
export const me = async (request, response) => {
    const {
        user: { id },
    } = request

    let data = await UserModel.findByPk(id, {
        include: [
            {
                model: BusinessModel,
                as: 'business',
                attributes: [],
            },
        ],
        raw: true,
        attributes: [
            'id',
            'full_name',
            'email',
            'role_title',
            'status',
            'business_id',
            'business_title',
            'role_id',
            'updatedAt',
            'createdAt',
            'business.description',
            'business.title',
            'business.contact_info',
        ],
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

    data.slug = data?.organizationSlug

    const removeFields = ['password_token', 'password', 'verification_code']

    /* remove specific fields */
    data = omit(JSON.parse(JSON.stringify(data)), removeFields)

    /* send response */
    return response.json({
        data,
    })
}
