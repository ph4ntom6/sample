import axios from 'axios'

// eslint-disable-next-line import/no-extraneous-dependencies
import * as cheerio from 'cheerio'
import * as Sentry from '@sentry/node'

import { BillTodaysLawModel } from '../models'
import checkSlackNotification from '../helpers/check-slack-notification'
import dayjs from '../helpers/dayjs'

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (CrawlLawOfTodayQueue) => {
    CrawlLawOfTodayQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------  Crawl law of today job is in progress ------`)
        const { bill } = job.data
        try {
            /* fetch bill xml */
            const response = await axios.get(
                `https://leginfo.legislature.ca.gov/faces/billCompareClient.xhtml?bill_id=${bill?.bill_id}&showamends=false`
            )

            const $ = await cheerio.load(response.data)
            const targetDiv = $(`#content_main`)

            if (targetDiv?.length > 0) {
                const divContent = await targetDiv
                    .find('#centercolumn #billcompareform #billtext1 #bill_all')
                    .html()

                // eslint-disable-next-line no-console
                console.log(
                    `------------ Bill content of bill id ----------`,
                    bill?.bill_id
                )

                await BillTodaysLawModel.upsert(
                    {
                        bill_id: bill?.bill_id,
                        content: divContent,
                        bill_version_id: bill?.latest_bill_version_id,
                    },
                    {
                        where: {
                            bill_id: bill?.bill_id,
                        },
                    }
                )
            }

            // eslint-disable-next-line
            console.log(`------  Crawl law of today job is completed ------`)

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Crawl law of today job is aborted -----${error}`
            )
            const notification = `❌ Crawl law of today job is aborted for bill id ${
                bill?.bill_id
            } bill version id ${bill?.bill_id} at ${dayjs()}`

            await checkSlackNotification({
                error,
                recordTitle: 'crawl-law-of-today',
                notification,
                notificationTitle: 'Crawl Law Of Today Job Status',
            })

            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
