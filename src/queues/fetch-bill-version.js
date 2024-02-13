import Queue from 'bull'
import { config } from 'dotenv'

import * as Sentry from '@sentry/node'

import bullConfig from '../config/bull'

import { BillModel, BillVersionModel } from '../models'

import checkSlackNotification from '../helpers/check-slack-notification'

import dayjs from '../helpers/dayjs'

const AddBillVersionHtmlPDFQueue = new Queue(
    'Add Bill Version Html',
    bullConfig
)

config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (fetchBillVersionQueue) => {
    fetchBillVersionQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------  Fetch bill version job is in progress ------`)
        try {
            const limit = 10
            let offset = 0
            let bills = []

            do {
                /* get bills whose version's html is empty */
                bills = await BillModel.findAll({
                    include: {
                        model: BillVersionModel,
                        as: 'versions',
                        attributes: ['bill_version_id'],
                    },
                    attributes: ['bill_id'],
                    where: {
                        '$versions.bill_html$': null,
                        '$versions.pdf_exists$': false,
                    },
                    subQuery: false,
                    limit,
                    offset,
                })

                /* process bills */
                for (let index = 0; index < bills?.length; index++) {
                    const bill = bills[index]
                    if (bill?.versions?.length) {
                        await AddBillVersionHtmlPDFQueue.add(
                            { bill },
                            {
                                removeOnComplete: true,
                            }
                        )
                    }
                }
                offset += limit
            } while (bills?.length)

            // eslint-disable-next-line
            console.log(`------  Fetch bill version job is completed ------`)

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Fetch bill version job is aborted -----${error}`
            )
            const notification = `❌ Fetch bill version job is aborted at ${dayjs()}`

            await checkSlackNotification({
                error,
                recordTitle: 'fetch-bill-version',
                notification,
                notificationTitle: 'Fetch Bill Version Job Status',
            })

            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
