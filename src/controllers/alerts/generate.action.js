import Queue from 'bull'
import bullConfig from '../../config/bull'

import { BillHistoryModel } from '../../models'
const GenerateAlertForMultipleBusinessesQueue = new Queue(
    'Generate Alert For Multiple Business',
    bullConfig
)

/**
 * @description The function will generate alert
 * @input
 * @return (Message)
 */
export const generateAlerts = async (request, response) => {
    const data = await BillHistoryModel.updateBulk({
        params: { alerts_exist: 1 },
        body: {
            alerts_exist: 0,
        },
    })
    await GenerateAlertForMultipleBusinessesQueue.add({}, { delay: 10000 })
    return response.json({
        message: 'Alert generation in progress',
        data,
    })
}
