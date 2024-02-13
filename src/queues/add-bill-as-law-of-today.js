import Queue from 'bull'
import { config } from 'dotenv'
import { Op, col } from 'sequelize'

import * as Sentry from '@sentry/node'

import dayjs from '../helpers/dayjs'
import bullConfig from '../config/bull'

import { BillModel, BillTodaysLawModel } from '../models'

import checkSlackNotification from '../helpers/check-slack-notification'

const CrawlLawOfTodayQueue = new Queue('Crawl Law Of Today', bullConfig)

config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (addBillAsLawOfTodayQueue) => {
    addBillAsLawOfTodayQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(
            `------  Add bill law as of today job is in progress ------`
        )
        try {
            const limit = 50
            let offset = 0
            let bills = []

            do {
                /* initially find bills for which content does not exist or their versions have been updated. */
                bills = await BillModel.findAll({
                    attributes: ['bill_id', 'latest_bill_version_id'],
                    include: [
                        {
                            model: BillTodaysLawModel,
                            as: 'bill_todays_laws',
                            attributes: [
                                'bill_id',
                                'content',
                                'bill_version_id',
                            ],
                            required: false,
                        },
                    ],
                    where: {
                        [Op.or]: [
                            /* bill does not exist */
                            {
                                '$bill_todays_laws.bill_version_id$': {
                                    [Op.is]: null,
                                },
                            },
                            /* bill version is updated */
                            {
                                '$bill_todays_laws.bill_version_id$': {
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
                for (let index = 0; index < bills?.length; index++) {
                    const bill = bills[index]
                    await CrawlLawOfTodayQueue.add(
                        { bill },
                        {
                            removeOnComplete: true,
                        }
                    )
                }
                offset += limit
            } while (bills?.length)

            // eslint-disable-next-line
            console.log(
                `------  Add bill law as of today job is completed ------`
            )

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Add bill law as of today job is aborted -----${error}`
            )
            const notification = `❌ Add bill law as of today job is aborted at ${dayjs()}`
            await checkSlackNotification({
                error,
                recordTitle: 'bill-law-as-of-today',
                notification,
                notificationTitle: 'Add Bill Law As Of Today Job Status',
            })
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
