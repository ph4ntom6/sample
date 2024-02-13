import { config } from 'dotenv'
import { Op } from 'sequelize'
import * as Sentry from '@sentry/node'

import {
    BillModel,
    // ClientModel,
    BillHistoryModel,
    BillVersionModel,
    // ClientBillTrackingModel,
    AlertModel,
} from '../models'

import dayjs from '../helpers/dayjs'
import checkSlackNotification from '../helpers/check-slack-notification'

// import processBillHistory from '../helpers/generate-alerts'

config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (multipleBusinessAlertQueue) => {
    multipleBusinessAlertQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(
            `------  Multiple Businesses Alert Job is in progress ------`
        )

        try {
            /* process bills */
            const limit = 15
            let offset = 0
            let billHistoryData = []
            const billHistoryIds = []
            do {
                billHistoryData = await BillHistoryModel.findAll({
                    where: { alerts_exist: { [Op.eq]: false } },
                    attributes: [
                        'action',
                        'bill_id',
                        'action_date',
                        'bill_history_id',
                    ],
                    include: [
                        {
                            model: BillModel,
                            as: 'bills',
                            attributes: ['bill_id', 'current_status'],
                            required: false,
                            include: [
                                {
                                    model: BillVersionModel,
                                    as: 'version',
                                    attributes: ['subject'],
                                },
                                // {
                                //     model: ClientBillTrackingModel,
                                //     as: 'client_bill_trackings',
                                //     attributes: ['id'],
                                //     include: [
                                //         {
                                //             model: ClientModel,
                                //             as: 'bill_clients',
                                //             attributes: [
                                //                 'id',
                                //                 'business_id',
                                //                 'associate_id',
                                //                 'client_name',
                                //             ],
                                //         },
                                //     ],
                                // },
                            ],
                        },
                    ],
                    offset,
                    limit,
                })

                const alerts = []

                for (const billHistory of billHistoryData) {
                    /* process bill history */
                    // const generated = await processBillHistory(
                    // billHistory,
                    // billHistoryIndex
                    // )
                    const alert = {
                        user_id: null,
                        business_id: null,
                        details: billHistory?.action,
                        bill_id: billHistory?.bill_id,
                        bill_history_id: billHistory?.bill_history_id,
                        bill_status: billHistory?.bills?.current_status,
                        bill_subject: billHistory?.bills?.version?.subject,
                        action_date: billHistory?.action_date
                            ? dayjs(billHistory?.action_date)
                            : null,
                        clients: [],
                    }
                    alerts.push(alert)
                    billHistoryIds.push(billHistory?.bill_history_id)
                }

                if (alerts?.length) {
                    await AlertModel.bulkCreate(alerts)
                }
                offset += limit
            } while (billHistoryData?.length)

            if (billHistoryIds?.length) {
                await BillHistoryModel.update({
                    params: {
                        bill_history_id: { [Op.in]: billHistoryIds },
                    },
                    body: { alerts_exist: true },
                })
            }

            // eslint-disable-next-line
            console.log(
                `------  Multiple Businesses Alert Job is completed -------`
            )

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Multiple Businesses Alert Job is aborted -----${error}`
            )
            const notification = `❌ Multiple Businesses Alert Job is aborted at ${dayjs()}`

            await checkSlackNotification({
                error,
                recordTitle: 'multiple-business-alert',
                notification,
                notificationTitle: 'Multiple Businesses Alert Job Status',
            })
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
