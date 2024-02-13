import { config } from 'dotenv'
import { Op, col } from 'sequelize'

import * as Sentry from '@sentry/node'

import { BillModel, BillCodeModel } from '../models'

import processBills from '../helpers/update-bill-codes'
import checkSlackNotification from '../helpers/check-slack-notification'

import dayjs from '../helpers/dayjs'

config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (updateBillCodesQueue) => {
    updateBillCodesQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------  Update bill codes job is in progress ------`)
        try {
            const limit = 50
            let offset = 0
            let bills = []

            do {
                /* initially find bills for which codes do not exist or their versions have been updated. */
                bills = await BillModel.findAll({
                    attributes: ['bill_id', 'latest_bill_version_id'],
                    include: [
                        {
                            model: BillCodeModel,
                            as: 'bill_codes',
                            attributes: ['bill_version_id'],
                            required: false,
                        },
                    ],
                    where: {
                        [Op.or]: [
                            /* bill code does not exist */
                            {
                                '$bill_codes.bill_version_id$': {
                                    [Op.is]: null,
                                },
                            },
                            /* bill version is updated */
                            {
                                '$bill_codes.bill_version_id$': {
                                    [Op.ne]: col(
                                        'bills.latest_bill_version_id'
                                    ),
                                },
                            },
                        ],
                    },
                    raw: true,
                    subQuery: false,
                    limit,
                    offset,
                })

                /* process bills */
                await processBills(bills, done, Sentry)

                offset += limit
            } while (bills?.length)

            // eslint-disable-next-line
            console.log(`------  Update bill codes job is completed ------`)

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Update bill codes job is aborted -----${error}`
            )
            const notification = `❌ Add bill law as of today job is aborted at ${dayjs()}`

            await checkSlackNotification({
                error,
                recordTitle: 'update-bill-code',
                notification,
                notificationTitle: 'Update Bill Code Job Status',
            })

            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
