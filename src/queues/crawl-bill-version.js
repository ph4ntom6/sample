import path from 'path'
import puppeteer from 'puppeteer'
import { existsSync, mkdirSync } from 'fs'
// eslint-disable-next-line import/no-extraneous-dependencies
import * as cheerio from 'cheerio'
import * as Sentry from '@sentry/node'

import dayjs from '../helpers/dayjs'
import checkSlackNotification from '../helpers/check-slack-notification'

import { BillVersionModel } from '../models'

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (CrawlBillVersionQueue) => {
    CrawlBillVersionQueue.process(2, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------  Crawl bill version job is in progress ------`)
        const { url, optionValue, selectBoxSelector, buttonSelector, billId } =
            job.data
        try {
            /* launch browser */
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: ['--no-sandbox', '--headless', '--disable-gpu'],
            })

            const page = await browser.newPage()
            await page.setDefaultNavigationTimeout(90000) // 90 seconds
            await page.goto(url)

            await page.select(selectBoxSelector, optionValue)
            await page.click(buttonSelector)
            await page
                .waitForNavigation({ waitUntil: 'domcontentloaded' })
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.error(`Navigation error: ${err?.message}`)
                })
            const refreshedPageContent = await page.content()

            // eslint-disable-next-line no-console
            console.log(
                `-------------- Selected option: ---------------- ${optionValue}`
            )

            const $ = await cheerio.load(refreshedPageContent)
            const targetDiv = $(`#bill_nav_bill_text`)
            /* remove strike tag */
            targetDiv.find('strike').remove()
            /* remove blue font color */
            targetDiv.find('font.blue_text').removeAttr('color')

            const divContent = await targetDiv.find('#bill_all').html()
            /* wait for the selector to be available */
            const billVersionSelector = '#bill_version'
            await page.waitForSelector(billVersionSelector)

            /*  get the elements with the id "bill_version" */
            const billVersionElements = await page.$(billVersionSelector)

            const allDescendants = await billVersionElements.$$('*')
            const element = allDescendants[1]

            const innerText = await page.evaluate((el) => el.innerText, element)

            if (innerText?.trim() == 'Bill PDF') {
                const downloadPath = path.join(
                    __dirname,
                    '..',
                    '..',
                    'storage',
                    'bill-pdfs'
                )
                if (!existsSync(downloadPath)) {
                    // If the directory does not exist, create it
                    mkdirSync(downloadPath, { recursive: true })
                    // eslint-disable-next-line no-console
                    console.log(`Directory ${downloadPath} created.`)
                }

                /* use the browser to initiate the download */
                const client = await page.target().createCDPSession()

                await client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: downloadPath,
                })
                // Get the href attribute of the anchor <tag /
                const downloadLink = await page.evaluate(
                    (el) => el.getAttribute('href'),
                    element
                )
                // eslint-disable-next-line no-console
                console.log(downloadLink)
                // Extract the file name from the download link
                const fileNameMatch = /filename="(.*)"/.exec(downloadLink)
                const fileName = fileNameMatch
                    ? fileNameMatch[1]
                    : 'downloaded.pdf'

                // eslint-disable-next-line no-console
                console.log(`File downloaded: ${fileName}`)

                /* click anchor tag to trigger download */
                await element.click()
                /* wait for some time allow file to download */
                await page.waitForTimeout(5000)
            }

            if (divContent) {
                await BillVersionModel.update({
                    params: {
                        bill_id: billId,
                        bill_version_id: optionValue,
                    },
                    body: {
                        bill_html: divContent,
                        pdf_exists: true,
                    },
                })
            }

            await page.close()
            await browser.close()
            // eslint-disable-next-line
            console.log(`------  Crawl bill version job is completed ------`)

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Crawl bill version job is aborted -----${error}`
            )
            const notification = `❌ Crawl bill version job is aborted for bill id ${billId} bill version ${optionValue} at ${dayjs()}`

            await checkSlackNotification({
                error,
                recordTitle: 'crawl-bill-version',
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
