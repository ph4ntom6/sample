import * as Sentry from '@sentry/node'

import isArray from 'lodash/isArray'

import { Op } from 'sequelize'

import sequelize, {
    BillModel,
    BillVersionModel,
    ClientBillTrackingModel,
} from '../models'

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (addBillTrackClient) => {
    addBillTrackClient.process(2, async (job, done) => {
        try {
            // eslint-disable-next-line
            console.log(
                `------  Add client tracked bills job is in progress ------`
            )
            const { clientId, trackingBillIds, trackingKeywords } = job.data
            const billTrackingData = []
            await sequelize.transaction(async (transaction) => {
                // if tracking bill is given(not null)
                if (isArray(trackingBillIds)) {
                    /* delete existing clients bill tracking records */
                    await ClientBillTrackingModel.destroy(
                        {
                            where: {
                                client_id: clientId,
                                keyword_track: false,
                            },
                        },
                        { transaction }
                    )
                    // if tracking bill is given and not empty
                    if (trackingBillIds?.length) {
                        const bills = await BillModel.findAll({
                            where: {
                                bill_id: {
                                    [Op.in]: trackingBillIds,
                                },
                            },
                            attributes: ['bill_id', 'latest_bill_version_id'],
                            transaction,
                        })
                        bills?.forEach((bill) => {
                            billTrackingData.push({
                                bill_id: bill?.bill_id,
                                bill_version_id: bill?.latest_bill_version_id,
                                client_id: clientId,
                            })
                        })
                    }
                }
                //  if the tracking keywords is given(not null)
                if (isArray(trackingKeywords)) {
                    await ClientBillTrackingModel.destroy(
                        {
                            where: {
                                client_id: clientId,
                                keyword_track: true,
                            },
                        },
                        { transaction }
                    )
                    // if tracking keyword is given and length is not empty
                    if (trackingKeywords?.length) {
                        const keywordSearch = trackingKeywords.map((key) => {
                            return { [Op.like]: `%${key}%` }
                        })
                        const bills = await BillModel.findAll({
                            include: {
                                model: BillVersionModel,
                                as: 'version',
                                attributes: [],
                                where: {
                                    bill_xml: {
                                        [Op.or]: keywordSearch,
                                    },
                                },
                            },
                            attributes: ['bill_id', 'latest_bill_version_id'],
                            transaction,
                        })
                        bills?.forEach((bill) => {
                            billTrackingData.push({
                                bill_id: bill?.bill_id,
                                bill_version_id: bill?.latest_bill_version_id,
                                client_id: clientId,
                                keyword_track: true,
                            })
                        })
                    }
                }
                if (billTrackingData?.length) {
                    /* Bulk create/update the trackingBills data */
                    await ClientBillTrackingModel.bulkCreate(billTrackingData, {
                        transaction,
                    })
                }
            })

            // eslint-disable-next-line
            console.log(
                `------  Add client tracked bills job is completed ------`
            )

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Add client tracked bills job is aborted -----${error}`
            )
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
