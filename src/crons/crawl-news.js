import Queue from 'bull'
import bullConfig from '../config/bull'

const CrawlNewsQueue = new Queue('Crawl News', bullConfig)

export default async () => {
    try {
        // eslint-disable-next-line
        console.log(`------  Crawl News Cron Progress ------`)
        const options = {
            // re-attempt 3 times if job fails after a delay of 2 secs
            removeOnComplete: true,
            attempts: 3,
            backoff: 2000,
        }

        CrawlNewsQueue.add(options)
        // eslint-disable-next-line
        console.log(`------  Crawl News Cron Completed ------`)
    } catch (error) {
        // eslint-disable-next-line
        console.log(`------  Crawl News Cron Aborted ------${error}`)
    }
}
