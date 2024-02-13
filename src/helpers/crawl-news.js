import dayjs from '../helpers/dayjs'
// eslint-disable-next-line import/no-extraneous-dependencies
import { parseString } from 'xml2js'
import { NewsSourceModel, NewsModel } from '../models'

import dotenv from 'dotenv'
import * as Sentry from '@sentry/node'
import axios from 'axios'

dotenv.config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
})

export default async () => {
    try {
        /* fetch xml */
        const response = await axios.get('https://www.gov.ca.gov/feed/')
        const xmlData = response?.data
        let parsedData = {}
        /* parse xlm2js */
        parseString(xmlData, { explicitArray: false }, (err, result) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err)
                // submit error to sentry
                Sentry.captureException(err)
                return
            }
            parsedData = result
        })

        /* get channel */
        const channel = parsedData?.rss?.channel
        let newsSource = await NewsSourceModel.findOne({
            where: { name: channel?.title, feed_url: channel?.link },
        })
        const sourceAlreadyExist = !!newsSource
        const lastBuildDate = channel?.lastBuildDate
            ? dayjs(channel?.lastBuildDate)
            : ''
        /* create new source */
        if (!sourceAlreadyExist) {
            newsSource = await NewsSourceModel.create({
                body: {
                    name: channel?.title,
                    feed_url: channel?.link,
                    crawled_at: dayjs(),
                    last_build_at: lastBuildDate,
                },
            })
        }
        /* allow new source */
        /* check if the data is being updated if source already exist */
        if (
            (sourceAlreadyExist &&
                !lastBuildDate?.isSame(dayjs(newsSource?.last_build_at))) ||
            !sourceAlreadyExist
        ) {
            const newsBody = []
            const items = channel?.item
            for (const item of items) {
                /* get all news from new source */
                /* get updated news from existing source */
                if (
                    !sourceAlreadyExist ||
                    (sourceAlreadyExist &&
                        dayjs(item?.pubDate)?.isAfter(
                            dayjs(newsSource?.last_build_at)
                        ))
                )
                    newsBody.push({
                        source_id: newsSource?.id,
                        source_name: newsSource?.name,
                        data: {
                            link: item?.link,
                            title: item?.title,
                            pub_date: item?.pubDate,
                            category: item?.category,
                            description: item?.description,
                        },
                    })
            }
            /* create news if exist */
            if (newsBody?.length) {
                await NewsModel.createBulk(newsBody)
            }
        }
    } catch (error) {
        // submit error to sentry
        Sentry.captureException(error)
    }
}
