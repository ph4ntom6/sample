import translate from '../../helpers/translate'

import sequelize, {
    ClientModel,
    ClientScorecardModel,
    ClientBillImpactsModel,
    ClientBillTrackingModel,
} from '../../models'

/** Remove Client, its impacts, its trackings and its scorecard
 * @description This function will remove the client
 * @input id
 * @return (Object)
 */
export const remove = async (request, response) => {
    const {
        params: { id },
    } = request

    await sequelize.transaction(async (transaction) => {
        await ClientBillImpactsModel.destroy(
            { where: { client_id: id } },
            {
                transaction,
            }
        )

        await ClientBillTrackingModel.destroy(
            { where: { client_id: id } },
            {
                transaction,
            }
        )

        await ClientScorecardModel.destroy(
            { where: { client_id: id } },
            {
                transaction,
            }
        )

        await ClientModel.destroy(
            { where: { id } },
            {
                transaction,
            }
        )
    })

    response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Client has',
            ':action': 'deleted',
        }),
    })
}
