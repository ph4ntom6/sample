import { fn, col } from 'sequelize'

import { ClientModel } from '../../models'

/**  Count client
 * @description The function will return the number of clients active and in-active
 * * @input none
 * @return (Object)
 */
export const count = async (request, response) => {
    const data = await ClientModel.findAll({
        attributes: ['status', [fn('COUNT', col('*')), 'count']],
        group: ['status'],
        raw: true,
    })
    response.json({
        data,
    })
}
