import { config } from 'dotenv'

import exec from '../helpers/exec'
import generateAssistantId from '../helpers/generate-assistant-id'

import { BillVersionModel, ClientBillImpactsModel } from '../models'
// import generatePdfFileName from '../helpers/generate-pdf-file-name'
// import path from 'path'

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
        console.log(`------  Add client impacts job is in progress ------`)
        try {
            const {
                billId,
                billVersionId,
                clientName,
                goals,
                clientId,
                clientBillImpactId,
            } = job.data

            // eslint-disable-next-line
            console.log(
                '-------------1.inside queue----------------------------------'
            )
            const data = await BillVersionModel.findOne({
                where: {
                    bill_id: billId,
                    bill_version_id: billVersionId,
                },
                attributes: [
                    'impacts',
                    'bill_version_id',
                    'version_num',
                    'assistant_id',
                    'assistant_id_code',
                ],
            })
            // eslint-disable-next-line
            console.log(
                '----------------------------------',
                data?.assistant_id,
                'assistant_id----------------------------------'
            )
            if (!data?.assistant_id) {
                const assistantId = await generateAssistantId(data)
                if (assistantId) {
                    data.assistant_id = assistantId
                    await data.save()
                }
            }

            // const fileName = generatePdfFileName(data)
            // const filePath = path.join(
            //     __dirname,
            //     '..',
            //     '..',
            //     'storage',
            //     'bill-pdfs',
            //     fileName
            // )

            // eslint-disable-next-line
            console.log(
                '----------------------------------',
                data?.assistant_id,
                'assistant_id after generation----------------------------------'
            )
            if (data?.assistant_id) {
                const policies = JSON.stringify(goals)
                const payload = {
                    client_id: clientId,
                    bill_id: billId,
                    bill_version_id: billVersionId,
                    is_processing: false,
                }
                // eslint-disable-next-line
                console.log(
                    clientBillImpactId,
                    '----------------------------------clientBillImpact----------------------------------'
                )
                if (!clientBillImpactId) {
                    const clientImapct = await ClientBillImpactsModel.findOne({
                        where: payload,
                    })
                    // eslint-disable-next-line
                    console.log(clientImapct, payload, 'if exist then exit 5')
                    if (clientImapct) {
                        done()
                    }
                }
                const scriptStartTime = Date.now()
                // eslint-disable-next-line
                console.log(
                    scriptStartTime,
                    '----------------------------------start----------------------------------'
                )
                let impacts = await exec(
                    [
                        '--input',
                        `{"file_id":"${data?.assistant_id}","client":"${clientName}", "policies": ${policies}}`,
                    ],

                    'scripts/client_impacts.py'
                )
                const scriptEndTime = Date.now()

                const scriptDurationTime =
                    (scriptEndTime - scriptStartTime) / 1000 // save time in seconds
                if (clientBillImpactId) {
                    payload.id = clientBillImpactId
                }
                // eslint-disable-next-line
                console.log(
                    scriptEndTime,
                    scriptDurationTime,
                    '----------------------------------end----------------------------------'
                )
                impacts = JSON.parse(impacts)

                if (impacts?.code_interpreter === 'True') {
                    await BillVersionModel.update({
                        params: {
                            bill_version_id: billVersionId,
                        },
                        body: {
                            code_interpreter: impacts?.code_interpreter,
                            assistant_id_code: impacts?.assistant_id_code,
                        },
                    })
                }

                payload.positive_impact_content =
                    impacts?.result?.positive_impacts

                payload.positive_impact_count =
                    impacts?.result?.positive_impacts?.length ?? 0
                payload.negative_impact_content =
                    impacts?.result?.negative_impacts

                payload.negative_impact_count =
                    impacts?.result?.negative_impacts?.length ?? 0

                if (!clientBillImpactId) {
                    const clientImapct = await ClientBillImpactsModel.findOne({
                        where: payload,
                    })

                    if (clientImapct) {
                        payload.id = clientImapct?.id
                    }
                }
                payload.response_time = scriptDurationTime
                await ClientBillImpactsModel.upsert(payload)
            }

            // eslint-disable-next-line
            console.log(`------  Add client impacts job is completed ------`)

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                `--------- Add client impacts job is aborted -----${error}`
            )
            /* submit error to sentry */
            Sentry.captureException(error)
            /* hit callback with error */
            done(error)
        }
    })
}
