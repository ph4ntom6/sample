import { Op } from 'sequelize'
import sequelize, {
    BillModel,
    ClientBillTrackingModel,
    ClientModel,
} from '../models'

import { config } from 'dotenv'

import * as Sentry from '@sentry/node'
config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (addClientImpactsQueue) => {
    addClientImpactsQueue.process(2, async (job, done) => {
        // eslint-disable-next-line
        console.log(
            `------  Add bill clients tracking job is in progress ------`
        )
        try {
            const { billId, stance, clientIds } = job.data

            const clients = await ClientModel.findAll({
                where: {
                    id: {
                        [Op.in]: clientIds,
                    },
                },
                attributes: [
                    'id',
                    'tracking_bills',
                    'client_name',
                    'business_id',
                    'associate_id',
                    'industry_id',
                    'industry_title',
                    'status',
                    'short_bio',
                    'cp_name',
                    'cp_email',
                    'cp_phone',
                    'cp_address',
                    'interests_goals',
                    'tracking_bills',
                    'tracking_keywords',
                ],
                raw: true,
            })
            if (clients?.length) {
                const clientBillTrackingData = []
                const clientModelData = []
                await sequelize.transaction(async (transaction) => {
                    const bill = await BillModel.findOne({
                        where: { bill_id: billId },
                        attributes: ['latest_bill_version_id'],
                        raw: true,
                        transaction,
                    })

                    for (let i = 0; i < clients.length; i++) {
                        const client = clients[i]

                        // Add a new entry to tracking_bills array (assuming tracking_bills is an array)
                        if (!client.tracking_bills) {
                            client.tracking_bills = [] // Initialize tracking_bills if it's null
                        }
                        if (!client?.tracking_bills?.includes(billId)) {
                            clientBillTrackingData.push({
                                client_id: client?.id,
                                bill_id: billId,
                                stance: stance,
                                bill_version_id: bill?.latest_bill_version_id,
                            })

                            const billIds = [
                                ...new Set([...client.tracking_bills, billId]),
                            ]
                            clientModelData.push({
                                ...client,
                                tracking_bills: billIds,
                            })
                        }
                    }

                    await ClientModel.createBulk(clientModelData, {
                        updateOnDuplicate: ['tracking_bills'],
                        transaction,
                    })

                    await ClientBillTrackingModel.createBulk(
                        clientBillTrackingData,
                        {
                            updateOnDuplicate: ['client_id', 'bill_id'],
                            transaction,
                        }
                    )
                })
            }
            // eslint-disable-next-line
            console.log(
                `------  Add bill clients tracking job is completed ------`
            )

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Add bill clients tracking job is aborted -----${error}`
            )
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
