// import Queue from 'bull'

// import bullConfig from '../config/bull'

import * as Sentry from '@sentry/node'
import { BillModel, ClientBillTrackingModel, BillVersionModel } from '../models'

import { literal } from 'sequelize'

// import { isArray } from 'lodash'

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})
// const AddClientImpactsQueue = new Queue('Add Client Impacts', bullConfig)
//
// const UpdateClientBillImpactQueue = new Queue(
// 'Update Clients Bill Impacts',
// bullConfig
// )
export default (generateMultipleBillClientImpacts) => {
    generateMultipleBillClientImpacts.process(2, async (job, done) => {
        try {
            // eslint-disable-next-line
            console.log(
                '------ Generate Multiple Bill Client Impacts job is in progress ------'
            )

            const {
                clientId,
                // goals,
                // clientName,
                trackingBillIds,
                trackingKeywords,
                // goalsUpdated = false,
            } = job.data

            if (trackingBillIds?.length) {
                const bills = await BillModel.findAll({
                    where: { bill_id: trackingBillIds },
                })

                const billTrackingData = []
                for (const bill of bills) {
                    /* Add each bill to generate impact job if goals exist*/
                    // if (isArray(goals) && goals?.length && !goalsUpdated) {
                    // await AddClientImpactsQueue.add({
                    // goals,
                    // clientId,
                    // clientName,
                    // billId: bill?.bill_id,
                    // billVersionId: bill?.latest_bill_version_id,
                    // })
                    // }

                    /* create bill tracking data */
                    billTrackingData.push({
                        client_id: clientId,
                        bill_id: bill?.bill_id,
                        bill_version_id: bill?.latest_bill_version_id,
                        keyword_track: false,
                    })
                }

                /* if length exist then insert into client bill tracking */
                if (billTrackingData?.length) {
                    await ClientBillTrackingModel.createBulk(billTrackingData, {
                        updateOnDuplicate: ['bill_version_id'],
                    })
                }
            }

            if (trackingKeywords?.length) {
                for (const keyword of trackingKeywords) {
                    const limit = 15
                    let bills = []
                    const billTrackingData = []

                    bills = await BillModel.findAll({
                        include: {
                            model: BillVersionModel,
                            as: 'version',
                            attributes: [],
                            where: literal(
                                `LOWER(version.bill_xml) LIKE LOWER('%${keyword}%')`
                            ),
                        },
                        attributes: ['bill_id', 'latest_bill_version_id'],
                        limit,
                        raw: true,
                    })

                    for (const bill of bills) {
                        /* Add each bill to generate impact job if goals exist*/
                        // if (isArray(goals) && goals?.length && !goalsUpdated) {
                        //     await AddClientImpactsQueue.add({
                        //         goals,
                        //         clientId,
                        //         clientName,
                        //         billId: bill?.bill_id,
                        //         billVersionId: bill?.latest_bill_version_id,
                        //     })
                        // }
                        /* create bill tracking data */
                        const data = {
                            client_id: clientId,
                            bill_id: bill?.bill_id,
                            bill_version_id: bill?.latest_bill_version_id,
                            keyword_track: true,
                        }

                        const record = await ClientBillTrackingModel.findOne({
                            where: data,
                        })

                        let keywords = [keyword]
                        if (record && record?.keywords) {
                            keywords = [...keywords, ...record.keywords]
                        }
                        billTrackingData.push({ ...data, keywords })
                    }

                    /* if length exist then insert into client bill tracking */
                    if (billTrackingData?.length) {
                        await ClientBillTrackingModel.createBulk(
                            billTrackingData,
                            {
                                updateOnDuplicate: [
                                    'bill_version_id',
                                    'keywords',
                                ],
                            }
                        )
                    }
                }
            }

            // if (goalsUpdated) {
            //     await UpdateClientBillImpactQueue.add({
            //         clientId,
            //         clientName,
            //         goals,
            //         updateClientImpacts: true,
            //     })
            // }

            // eslint-disable-next-line
            console.log(
                '------ Generate Multiple Bill Client Impacts job is completed ------'
            )
            done()
        } catch (error) {
            // eslint-disable-next-line
            console.log(
                `--------- Generate Multiple Bill Client Impacts job is aborted -----${error}`
            )
            Sentry.captureException(error)
            done(error)
        }
    })
}
