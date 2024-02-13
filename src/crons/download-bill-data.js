import Queue from 'bull'
import bullConfig from '../config/bull'

const DownloadBillDataQueue = new Queue('Download Bill Data', bullConfig)

export default async () => {
    try {
        // eslint-disable-next-line
        console.log(`------ Download bill data cron is in progress ------`)
        const options = {
            // re-attempt 3 times if job fails after a delay of 2 secs
            removeOnComplete: true,
            attempts: 3,
            backoff: 2000,
        }

        DownloadBillDataQueue.add(options)
        // eslint-disable-next-line
        console.log(`------ Download bill data cron completed ------`)
    } catch (error) {
        // eslint-disable-next-line
        console.log(`------ Download bill data cron aborted ------${error}`)
    }
}
