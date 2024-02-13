import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'

import {
    BusinessModel,
    ClientModel,
    IndustryModel,
    UserModel,
} from '../../models'

/* Get Single Client
 * @description This method will fetch a single record of client
 * @input id
 * @return (Object)
 */
export const view = async (request, response) => {
    const {
        params: { id },
    } = request
    const data = await ClientModel.findByPk(id, {
        include: [
            {
                model: BusinessModel,
                as: 'business',
                attributes: ['title', 'description', 'status', 'contact_info'],
            },
            {
                model: UserModel,
                as: 'associate',
                attributes: ['full_name', 'email'],
            },
            {
                model: IndustryModel,
                as: 'industry',
                attributes: ['title'],
            },
        ],
    })

    /* return error if client is not found */
    if (!data) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Client',
            }),
            404
        )
    }
    /* send response */
    response.json({
        data,
    })
}
