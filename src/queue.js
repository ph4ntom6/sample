import Queue from 'bull'
import bullConfig from './config/bull'

import MessageJob from './queues/message'
import CrawlNewsJob from './queues/crawl-news'
import GenerateDraftJob from './queues/generate-draft'
import UpdateBillCodesJob from './queues/update-bill-codes'
import CrawlLawOfTodayJob from './queues/crawl-law-of-today'
import CrawlBillVersionJob from './queues/crawl-bill-version'
import DownloadBillDataJob from './queues/download-bill-data'
import FetchBillVersionJob from './queues/fetch-bill-version'
import AddClientImpactsJob from './queues/add-client-impacts'
import UpdateClientStanceJob from './queues/update-client-stance'
import GenerateBillSummaryJob from './queues/generate-bill-summary'
import DeleteClientImapctsJob from './queues/delete-client-imapcts'
import AddBillVersionHtmlJob from './queues/add-bill-version-html-pdf'
import AddBillAsLawOfTodayJob from './queues/add-bill-as-law-of-today'
import UpdateClientBillImpactJob from './queues/update-client-bill-impacts'
import AddClientTrackedBillsJob from './queues/add-client-tracked-bills'
import AddBillClientsTrackingJob from './queues/add-bill-clients-tracking'
import GenerateAlertForMultipleBusinessesJob from './queues/generate-alert-for-multiple-business'
import GenerateMultipleBillClientImpactsJob from './queues/generate-multiple-bill-client-impacts'
// import GenerateKeywordTrackedBillClientImpactsJob from './queues/generate-keyword-tracked-bill-client-impacts'

const CrawlNewsQueue = new Queue('Crawl News', bullConfig)
const UpdateBillCodesQueue = new Queue('Update Bill Codes', bullConfig)
const CrawlLawOfTodayQueue = new Queue('Crawl Law Of Today', bullConfig)
const CrawlBillVersionQueue = new Queue('Crawl Bill Version', bullConfig)
const AddBillAsLawOfTodayQueue = new Queue(
    'Add Bill As Law Of Today',
    bullConfig
)
const DownloadBillDataQueue = new Queue('Download Bill Data', bullConfig)
const FetchBillVersionQueue = new Queue('Fetch Bill Version', bullConfig)
const AddClientImpactsQueue = new Queue('Add Client Impacts', bullConfig)
const AddBillVersionHtmlQueue = new Queue('Add Bill Version Html', bullConfig)
const UpdateClientStanceQueue = new Queue('Update Client Stance', bullConfig)
const UpdateClientBillImpactQueue = new Queue(
    'Update Clients Bill Impacts',
    bullConfig
)
const AddClientTrackedBillsQueue = new Queue(
    'Add Client Tracked Bills',
    bullConfig
)
const MessageQueue = new Queue('Message Queue', bullConfig)
const GenerateAlertForMultipleBusinessesQueue = new Queue(
    'Generate Alert For Multiple Business',
    bullConfig
)
const GenerateBillSummaryQueue = new Queue(
    'Generate Bill Summary Queue',
    bullConfig
)
const GenerateDraftQueue = new Queue('Generate Draft Queue', bullConfig)
const AddBillClientsTracking = new Queue(
    'Add Bill Clients Tracking',
    bullConfig
)
const GenerateMultipleBillClientImpactsQueue = new Queue(
    'Generate Multiple Bill Client Impacts',
    bullConfig
)
const DeleteClientImapctsQueue = new Queue('Delete Client Impacts', bullConfig)

MessageJob(MessageQueue)
CrawlNewsJob(CrawlNewsQueue)
GenerateDraftJob(GenerateDraftQueue)
CrawlLawOfTodayJob(CrawlLawOfTodayQueue)
UpdateBillCodesJob(UpdateBillCodesQueue)
CrawlBillVersionJob(CrawlBillVersionQueue)
DownloadBillDataJob(DownloadBillDataQueue)
FetchBillVersionJob(FetchBillVersionQueue)
AddClientImpactsJob(AddClientImpactsQueue)
UpdateClientStanceJob(UpdateClientStanceQueue)
AddBillVersionHtmlJob(AddBillVersionHtmlQueue)
AddBillAsLawOfTodayJob(AddBillAsLawOfTodayQueue)
DeleteClientImapctsJob(DeleteClientImapctsQueue)
GenerateBillSummaryJob(GenerateBillSummaryQueue)
UpdateClientBillImpactJob(UpdateClientBillImpactQueue)
AddClientTrackedBillsJob(AddClientTrackedBillsQueue)
AddBillClientsTrackingJob(AddBillClientsTracking)

GenerateAlertForMultipleBusinessesJob(GenerateAlertForMultipleBusinessesQueue)
GenerateMultipleBillClientImpactsJob(GenerateMultipleBillClientImpactsQueue)
