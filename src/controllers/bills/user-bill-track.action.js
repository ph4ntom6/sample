/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */

/**
 * @description The function will add user bill track
 * @input bill id,
 * @return (Object)
 */

import { BillModel, UserBillTrackingModel } from '../../models'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'
export const addUserBillTrack = async (request, response) => {
    const {
        params: { id },
        body: { action },
        user,
    } = request

    const bill = await BillModel.findOne({
        where: {
            bill_id: id,
        },

        attributes: ['bill_id', 'latest_bill_version_id'],
    })

    if (!bill) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Bill',
            }),
            404
        )
    }

    if (action === 'follow') {
        await UserBillTrackingModel.create({
            body: {
                bill_id: id,
                user_id: user?.id,
                business_id: user?.business_id,
                bill_version_id: bill?.latest_bill_version_id,
            },
        })
    }

    if (action === 'unfollow') {
        await UserBillTrackingModel.destroy({
            where: {
                bill_id: id,
                user_id: user?.id,
                business_id: user?.business_id,
                bill_version_id: bill?.latest_bill_version_id,
            },
        })
    }

    /* send success response*/
    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Bill has',
            ':action': action == 'follow' ? 'followed' : 'unfollowed',
        }),
    })
}
