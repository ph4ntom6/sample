import Queue from 'bull'
import { config } from 'dotenv'
import puppeteer from 'puppeteer'

import * as Sentry from '@sentry/node'

import bullConfig from '../config/bull'

import dayjs from '../helpers/dayjs'
import checkSlackNotification from '../helpers/check-slack-notification'

const CrawlBillVersionQueue = new Queue('Crawl Bill Version', bullConfig)
config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (addBillVersionHtmlQueue) => {
    addBillVersionHtmlQueue.process(2, async (job, done) => {
        // eslint-disable-next-line
        console.log(
            `------  Add bill version html and pdf job is in progress ------`
        )
        const { bill } = job.data
        try {
            /* launch browser */
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: ['--no-sandbox', '--headless', '--disable-gpu'],
            })

            /* open a page */
            const page = await browser.newPage()
            await page.setDefaultNavigationTimeout(90000) // 90 seconds
            const url = `https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=${bill?.bill_id}`
            await page.goto(url)

            const selectBoxSelector = '#version'
            const buttonSelector = '#ddbill_version'

            const options = await page.evaluate((selectBoxSelector) => {
                const select = document.querySelector(selectBoxSelector)
                return Array.from(select?.options).map(
                    (option) => option?.value
                )
            }, selectBoxSelector)

            // eslint-disable-next-line no-console
            console.log(options, 'Options')
            // eslint-disable-next-line no-console
            console.log(bill?.versions, 'Versions')

            const billVersionIds = bill?.versions?.map(
                (version) => version?.bill_version_id
            )

            options.filter((a) => {
                if (billVersionIds?.includes(a)) {
                    return a
                }
            })

            for (const optionValue of options) {
                await CrawlBillVersionQueue.add(
                    {
                        url,
                        optionValue,
                        selectBoxSelector,
                        buttonSelector,
                        billId: bill?.bill_id,
                    },
                    { removeOnComplete: true }
                )
            }

            await page.close()
            await browser.close()
            // eslint-disable-next-line
            console.log(
                `------  Add bill version html and pdf job is completed ------`
            )

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Add bill version html and pdf job is aborted -----${error}`
            )

            const notification = `❌ Add bill version html and pdf job is aborted for bill id ${
                bill?.bill_id
            } at ${dayjs()}`

            await checkSlackNotification({
                error,
                recordTitle: 'add-bill-version-html-and-pdf',
                notification,
                notificationTitle: 'Add Bill Version Html And Pdf Job Status',
            })
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
