import { CronJob } from 'cron'

import CrawlNews from './crons/crawl-news'
import DownloadBillData from './crons/download-bill-data'

new CronJob( // Execute script
    '0 0 * * *', // cronTime: Once every day.
    CrawlNews // Execute script
).start()

new CronJob( // Execute script
    '5 0 * * *', // cronTime: Once every day at 00:05.
    DownloadBillData // Execute script
).start()
