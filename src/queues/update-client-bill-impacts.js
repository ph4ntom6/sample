// import Queue from 'bull'
// import bullConfig from '../config/bull'

import { config } from 'dotenv'
import { Op, col } from 'sequelize'

import * as Sentry from '@sentry/node'

import {
    BillModel,
    ClientBillImpactsModel,
    ClientBillTrackingModel,
    ClientModel,
} from '../models'

// const AddClientImpactsQueue = new Queue('Add Client Impacts', bullConfig)

config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (updateBillCodesQueue) => {
    updateBillCodesQueue.process(15, async (job, done) => {
        // eslint-disable-next-line
        console.log(
            `------  Update client bill impacts job is in progress ------`
        )
        try {
            const { updateClientImpacts, clientId } = job.data

            if (updateClientImpacts) {
                let where = {}

                if (!clientId) {
                    // bill version is updated
                    where = {
                        ...where,
                        '$client_bill_trackings.bill_version_id$': {
                            [Op.ne]: col('bills.latest_bill_version_id'),
                        },
                    }
                } else {
                    // interest and goals are updated
                    where = {
                        ...where,
                        '$client_bill_trackings.client_id$': {
                            [Op.eq]: clientId,
                        },
                    }
                }

                /* initially find bills for which their versions have been updated. */
                // const bills =
                await BillModel.findAll({
                    attributes: ['bill_id', 'latest_bill_version_id'],
                    include: [
                        {
                            model: ClientBillTrackingModel,
                            as: 'client_bill_trackings',
                            attributes: ['bill_version_id', 'id'],
                            required: false,
                            // required: true,
                            include: [
                                {
                                    model: ClientModel,
                                    as: 'bill_clients',
                                    attributes: [
                                        'client_name',
                                        'interests_goals',
                                        'id',
                                    ],
                                    required: false,
                                    // required: true,
                                    include: [
                                        {
                                            model: ClientBillImpactsModel,
                                            as: 'client_impacts',
                                            attributes: [
                                                'bill_version_id',
                                                'id',
                                                'client_id',
                                                'bill_id',
                                            ],
                                            required: false,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    where,
                    subQuery: false,
                    raw: true,
                })

                // for (const bill of bills) {
                // await AddClientImpactsQueue.add({
                // billId: bill['bill_id'],
                // billVersionId: clientId
                // ? bill['client_bill_trackings.bill_version_id']
                // : bill['latest_bill_version_id'],
                // clientId: bill['client_bill_trackings.bill_clients.id'],
                // clientBillImpactId:
                // bill[
                // 'client_bill_trackings.bill_clients.client_impacts.id'
                // ],
                // goals: bill[
                // 'client_bill_trackings.bill_clients.interests_goals'
                // ],
                // clientName:
                // bill[
                // 'client_bill_trackings.bill_clients.client_name'
                // ],
                // })
                // }
            }

            // eslint-disable-next-line
            console.log(
                `------  Update client bill impacts job is completed ------`
            )

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Update client bill impacts job is aborted -----${error}`
            )
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
