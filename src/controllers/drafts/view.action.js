import translate from '../../helpers/translate'

import { literal } from 'sequelize'

import AppValidationError from '../../exceptions/AppValidationError'

import {
    BillModel,
    BillVersionModel,
    BusinessModel,
    DraftModel,
    UserModel,
} from '../../models'

/**  View Draft
 * @description The function will return the draft
 * @input id
 * @return (Object)
 */
export const view = async (request, response) => {
    const {
        params: { id },
    } = request

    const data = await DraftModel.findByPk(id, {
        include: [
            {
                model: BusinessModel,
                as: 'business',
            },
            {
                model: UserModel,
                as: 'user',
                attributes: ['full_name'],
            },
            {
                model: BillModel,
                as: 'bills',
                attributes: [
                    'bill_id',
                    'bill_num',
                    'latest_bill_version_id',
                    [literal('`bills->version`.`version_num`'), 'version_num'],
                    [
                        literal('`bills->version`.`bill_version_id`'),
                        'bill_version_id',
                    ], // Specify the alias for bill_version_id
                    [literal('`bills->version`.`subject`'), 'subject'],
                ],
                include: [
                    {
                        model: BillVersionModel,
                        as: 'version',
                        attributes: [],
                    },
                ],
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

    response.json({
        data,
    })
}
