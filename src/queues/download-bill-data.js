import os from 'os'
import fs from 'fs'
import path from 'path'
import Queue from 'bull'
import dotenv from 'dotenv'
import * as Sentry from '@sentry/node'
// eslint-disable-next-line import/no-extraneous-dependencies
import AdmZip from 'adm-zip'
// eslint-disable-next-line import/no-extraneous-dependencies
import puppeteer from 'puppeteer'

import dayjs from '../helpers/dayjs'

import bullConfig from '../config/bull'

import { seedData } from '../scripts/seed-data-script'

const UpdateBillCodesQueue = new Queue('Update Bill Codes', bullConfig)
const AddBillAsLawOfTodayQueue = new Queue(
    'Add Bill As Law Of Today',
    bullConfig
)
const FetchBillVersionQueue = new Queue('Fetch Bill Version', bullConfig)
const UpdateClientStanceQueue = new Queue('Update Client Stance', bullConfig)
// const UpdateClientBillImpactQueue = new Queue(
// 'Update Clients Bill Impacts',
// bullConfig
// )
const GenerateAlertForMultipleBusinessesQueue = new Queue(
    'Generate Alert For Multiple Business',
    bullConfig
)
//
dotenv.config()

/* initiate the sentry instance */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (downloadBillDataQueue) => {
    downloadBillDataQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------ Download bill data job is in progress ------`)
        try {
            const tmpDir = os.tmpdir()

            /* launch browser */
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: ['--no-sandbox', '--headless', '--disable-gpu'],
            })

            /* open a page */
            const page = await browser.newPage()

            /* goto the leginfo download website */
            await page.goto(process.env.DATA_SOURCE_URL)

            /* wait till table tag */
            await page.waitForSelector('table')

            /* get all tr tags of table */
            const trTags = await page?.$$('table tbody tr')

            if (trTags) {
                for (const [index, trTag] of trTags.entries()) {
                    /* file content starts index 2 (index 0 and 1 contains heading and blank bar)  */
                    if (index > 1) {
                        // eslint-disable-next-line
                        console.log(
                            ` ------------- File at index ${index} starts-------------`
                        )

                        /* get all tags inside each trTag */
                        const nestedTags = await trTag.$$('*')

                        for (const nestedTag of nestedTags) {
                            await page.evaluate(
                                (tag) => tag.outerHTML,
                                nestedTag
                            )

                            const anchorElement = await nestedTag.$('td a')
                            if (anchorElement) {
                                /* extract the href attribute (file URL) from the anchor element */
                                const fileUrl = await page.evaluate(
                                    (anchor) => anchor.getAttribute('href'),
                                    anchorElement
                                )

                                /*  Extract the file name from the URL */
                                const fileName = fileUrl.split('/').pop()

                                /* create file name */
                                const yesterday = dayjs()
                                    .subtract(1, 'day')
                                    .format('ddd')

                                const fileToBeDownloaded = `pubinfo_${yesterday}.zip`

                                // eslint-disable-next-line no-console
                                console.log(
                                    '------------ File to be downloaded -------------',
                                    fileToBeDownloaded
                                )

                                if (fileName === fileToBeDownloaded) {
                                    const downloadDir = path.join(
                                        tmpDir,
                                        `bill-information-${yesterday}-${dayjs().unix()}`
                                    )

                                    if (!fs.existsSync(downloadDir)) {
                                        fs.mkdirSync(downloadDir)
                                    }

                                    await page.waitForTimeout(5000)
                                    const zipFilePath = path.join(
                                        downloadDir,
                                        fileName
                                    )

                                    /* use the browser to initiate the download */
                                    const client = await page
                                        .target()
                                        .createCDPSession()

                                    await client.send(
                                        'Page.setDownloadBehavior',
                                        {
                                            behavior: 'allow',
                                            downloadPath: downloadDir,
                                        }
                                    )

                                    /* click anchor tag to trigger download */
                                    await anchorElement.click()

                                    /* wait for some time allow file to download */
                                    await page.waitForTimeout(5000)

                                    const extractionDirectory = path.join(
                                        __dirname,
                                        '..',
                                        'scripts',
                                        'data'
                                    )

                                    if (!fs.existsSync(extractionDirectory)) {
                                        fs.mkdirSync(extractionDirectory)
                                    }

                                    // eslint-disable-next-line no-console
                                    console.log(
                                        extractionDirectory,
                                        'extractionDirectory',
                                        fs.existsSync(extractionDirectory)
                                    )

                                    if (fs.existsSync(extractionDirectory)) {
                                        /* read file and extract it to "data" folder */
                                        const zip = new AdmZip(zipFilePath)
                                        zip.extractAllTo(
                                            extractionDirectory,
                                            true
                                        )

                                        // await page.waitForTimeout(1000)
                                        /* list the files in the data directory after extraction */
                                        const extractedFiles =
                                            fs.readdirSync(extractionDirectory)

                                        // eslint-disable-next-line
                                        console.log(
                                            '---------------- Extracted Files: --------------------',
                                            extractedFiles
                                        )

                                        /* delete temp directory */
                                        fs.unlinkSync(zipFilePath)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            await seedData()

            await UpdateBillCodesQueue.add()

            await AddBillAsLawOfTodayQueue.add()

            await FetchBillVersionQueue.add()

            await UpdateClientStanceQueue.add()

            // await UpdateClientBillImpactQueue.add({
            // updateClientImpacts: true,
            // })

            await GenerateAlertForMultipleBusinessesQueue.add()

            // eslint-disable-next-line
            console.log(`------ Download bill data job completed ------`)
            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`---------Download bill data job aborted -----${error}`)
            /* submit error to sentry */
            Sentry.captureException(error)
            /*  hit callback with error */
            done(error)
        }
    })
}
