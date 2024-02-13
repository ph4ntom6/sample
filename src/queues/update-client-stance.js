import { config } from 'dotenv'
import { Op, col } from 'sequelize'

import * as Sentry from '@sentry/node'

import { BillModel, ClientBillTrackingModel } from '../models'
config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (updateClientStanceQueue) => {
    updateClientStanceQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------  Update Client Stance job is in progress ------`)
        try {
            const limit = 50
            let offset = 0
            let bills = []
            do {
                /* initially find bills for which codes do not exist or their versions have been updated. */

                bills = await BillModel.findAll({
                    attributes: ['bill_id', 'latest_bill_version_id'],
                    where: {
                        '$client_bill_trackings.bill_version_id$': {
                            [Op.ne]: col('bills.latest_bill_version_id'),
                        },
                    },
                    include: [
                        {
                            model: ClientBillTrackingModel,
                            as: 'client_bill_trackings',
                            attributes: [
                                'id',
                                'client_id',
                                'bill_version_id',
                                'bill_id',
                                'keyword_track',
                            ],
                            required: false,
                        },
                    ],
                    raw: true,
                    subQuery: false,
                    limit,
                    offset,
                })

                const record = []

                for (const bill of bills) {
                    record.push({
                        id: bill['client_bill_trackings.id'],
                        bill_id: bill?.bill_id,
                        client_id: bill['client_bill_trackings.client_id'],
                        bill_version_id: bill?.latest_bill_version_id,
                        keyword_track:
                            bill['client_bill_trackings.keyword_track'],
                        stance: 'neutral',
                    })
                }

                await ClientBillTrackingModel.createBulk(record, {
                    updateOnDuplicate: ['bill_version_id', 'stance'],
                })

                offset += limit
            } while (bills?.length)

            done()
            // eslint-disable-next-line
            console.log(`------  Update Client Stance job is completed ------`)
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Update Client Stance job is aborted -----${error}`
            )
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
