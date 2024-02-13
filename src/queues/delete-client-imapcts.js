import * as Sentry from '@sentry/node'

import { difference, map } from 'lodash'

import { Op, literal } from 'sequelize'

import { ClientBillImpactsModel, ClientBillTrackingModel } from '../models'
import dayjs from 'dayjs'

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
})

export default (generateMultipleBillClientImpacts) => {
    generateMultipleBillClientImpacts.process(2, async (job, done) => {
        try {
            // eslint-disable-next-line
            console.log(
                '------ Delete Client Impacts job is in progress ------'
            )

            const { clientId, deletedKeywords, deletedBillIds } = job.data

            const limit = 15
            let offset = 0
            const deletedKeywordsBillIds = []
            const timestamp = dayjs()

            const deleteBillTrackId = []

            const data = []
            if (deletedKeywords?.length) {
                let billTracking = []
                // const deleteBillTrackId = []

                do {
                    /* fetch the bill tracking having keywords */
                    billTracking = await ClientBillTrackingModel.findAll({
                        where: {
                            client_id: clientId,
                            keyword_track: true,
                            [Op.and]: deletedKeywords.map((keyword) =>
                                literal(
                                    `JSON_CONTAINS(keywords, '${JSON.stringify(
                                        keyword
                                    )}')`
                                )
                            ),
                        },
                        limit,
                        offset,
                    })

                    for (const item of billTracking) {
                        const keywords = difference(
                            item?.keywords,
                            deletedKeywords
                        )

                        /* remove the keyword from keywords and if keywords == [] 
                           then append it into deleteBillTrackId
                        */
                        const obj = {
                            id: item?.id,
                            client_id: item?.client_id,
                            bill_id: item?.bill_id,
                            bill_version_id: item?.bill_version_id,
                            keywords: keywords?.length ? keywords : null,
                            keyword_track: item?.keyword_track,
                        }

                        if (!keywords?.length) {
                            deleteBillTrackId.push(item?.id)
                            obj.bill_id = `${obj.bill_id}-${timestamp}`
                            obj.deleted_at = new Date()
                            /* bill ids of deleted keywords from frontend push
                               only those bills with no keywords to remove
                               impacts of bill that are not linked with any keyword  */
                            deletedKeywordsBillIds.push(item?.bill_id)
                        }
                        data.push(obj)
                    }

                    offset += limit
                } while (billTracking?.length)
            }

            if (deletedBillIds?.length) {
                const bills = await ClientBillTrackingModel.findAll({
                    where: {
                        client_id: clientId,
                        keyword_track: false,
                        bill_id: deletedBillIds,
                    },
                })
                for (const item of bills) {
                    data.push({
                        id: item?.id,
                        client_id: item?.client_id,
                        bill_id: `${item.bill_id}-${timestamp}`,
                        bill_version_id: item?.bill_version_id,
                        keywords: null,
                        keyword_track: item?.keyword_track,
                    })
                }
            }

            /* destroy records with no keywords or with deleted billids*/
            const condition = []
            if (deleteBillTrackId?.length) {
                condition.push({
                    id: deleteBillTrackId,
                    client_id: clientId,
                })
            }
            if (deletedBillIds?.length) {
                condition.push({
                    bill_id: deletedBillIds,
                    client_id: clientId,
                    keyword_track: false,
                })
            }

            if (condition?.length) {
                await ClientBillTrackingModel.destroy({
                    where: {
                        [Op.or]: condition,
                    },
                })
            }
            if (data?.length) {
                /* update keywords record */
                await ClientBillTrackingModel.createBulk(data, {
                    updateOnDuplicate: ['keywords', 'bill_id'],
                })
            }

            const conditionArray = []
            /* condition to fetch all records of keyword track false but 
               having the same bill id as generated by deleted keyword from frontend*/
            if (deletedKeywordsBillIds?.length)
                conditionArray.push({
                    client_id: clientId,
                    bill_id: deletedKeywordsBillIds,
                    keyword_track: false,
                })

            /* condition to fetch all records of keyword track true but 
               having the same bill id as of deleted bill id from frontend */
            if (deletedBillIds?.length) {
                conditionArray.push({
                    client_id: clientId,
                    bill_id: deletedBillIds,
                    keyword_track: true,
                })
            }

            /* fetch all the (bill_ids) that are tracked by both
               keyword and manually */
            const clientBillTracking = await ClientBillTrackingModel.findAll({
                where: {
                    [Op.or]: conditionArray,
                },
                attributes: ['bill_id'],
            })

            const billIds = map(clientBillTracking, 'bill_id')

            /* get all deleted bill ids */
            let deletedImpactsBillIds = [
                ...deletedBillIds,
                ...deletedKeywordsBillIds,
            ]

            /* remove those bill id that are tracked by both 
                   ways keyword and manually from array all 
                   deleted bill ids */
            deletedImpactsBillIds = difference(deletedImpactsBillIds, billIds)

            /* now delete impacts of deleted bill ids excluding those
                records that are tracked in both manner*/
            if (deletedImpactsBillIds?.length) {
                const data = []
                const ids = [1]
                const clientImpacts = await ClientBillImpactsModel.findAll({
                    where: {
                        client_id: clientId,
                        bill_id: deletedImpactsBillIds,
                    },
                })

                for (const item of clientImpacts) {
                    data.push({
                        id: item?.id,
                        client_id: item?.client_id,
                        bill_id: `${item.bill_id}-${timestamp}`,
                        bill_version_id: item?.bill_version_id,
                    })
                    ids.push(item?.id)
                }

                if (ids.length) {
                    await ClientBillImpactsModel.destroy({
                        where: {
                            id: ids,
                        },
                    })
                }
                if (data?.length) {
                    await ClientBillImpactsModel.createBulk(data, {
                        updateOnDuplicate: ['bill_id'],
                    })
                }
            }

            // eslint-disable-next-line
            console.log('------ Delete Client Impacts job is completed ------')
            done()
        } catch (error) {
            // eslint-disable-next-line
            console.log(
                `--------- Delete Client Impacts job is aborted -----${error}`
            )
            Sentry.captureException(error)
            done(error)
        }
    })
}
