import dotenv from 'dotenv'
import * as Sentry from '@sentry/node'

import crawlNews from '../helpers/crawl-news'

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

export default (crawlNewsQueue) => {
    crawlNewsQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(`------  Crawl News Job Progress ------`)
        try {
            await crawlNews()
            // eslint-disable-next-line
            console.log(`------  Crawl News Job Completed ------`)
            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`--------- Crawl News Job aborted -----${error}`)
            // submit error to sentry
            Sentry.captureException(error)
            // hit callback with error
            done(error)
        }
    })
}
