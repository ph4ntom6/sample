/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import dotenv from 'dotenv'
import { isString } from 'lodash'
import * as Sentry from '@sentry/node'

import exec from '../helpers/exec'
import generateAssistantId from '../helpers/generate-assistant-id'

import { BillVersionModel } from '../models'
// import generatePdfFileName from '../helpers/generate-pdf-file-name'
// import path from 'path'

dotenv.config()

/**
 * initiate the sentry instance
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
})

const normalizeAndParse = (data) => {
    let parsedData
    try {
        // Attempt to parse as JSON
        parsedData = JSON.parse(data)
        // If successful, check if it's an array
        if (Array.isArray(parsedData)) {
            // Data is already in the desired format
            return parsedData
        } else {
            // If not an array, wrap it in an array
            return [parsedData]
        }
    } catch (error) {
        // If parsing as JSON fails, treat it as a string and wrap in an array
        return [data]
    }
}

export default (generateBillSummaryQueue) => {
    generateBillSummaryQueue.process(1, async (job, done) => {
        // eslint-disable-next-line no-console
        console.log(
            '------ Generate bill summary job is in progress ------'
            // job?.data
        )

        try {
            const {
                data: { bill_version_id },
            } = job

            let updateData = false
            const data = await BillVersionModel.findOne({
                where: { bill_version_id, pdf_exists: true },
                attributes: [
                    'bill_version_id',
                    'summary',
                    'key_points',
                    'impacts',
                    'assistant_id',
                    'version_num',
                    'assistant_id_code',
                ],
                raw: true,
            })

            // const fileName = generatePdfFileName(data)
            // const filePath = path.join(
            //     __dirname,
            //     '..',
            //     '..',
            //     'storage',
            //     'bill-pdfs',
            //     fileName
            // )
            /* if assistant_id is not present, then generate assistant_id, */
            if (data && !data?.assistant_id) {
                const assistantId = await generateAssistantId(data)
                if (assistantId) {
                    data.assistant_id = assistantId
                    updateData = true
                }
            }

            if (
                data &&
                !data?.summary &&
                !data?.impacts &&
                !data?.key_points &&
                data?.assistant_id
            ) {
                const scriptStartTime = Date.now()
                /* get summary, key_points and impacts through script and save them in db */
                let summaryAndImpacts = await exec(
                    ['--input', `{ "file_id": "${data?.assistant_id}"}`],
                    'scripts/summary_keypoints.py'
                )
                const scriptEndTime = Date.now()
                const scriptDurationTime =
                    (scriptEndTime - scriptStartTime) / 1000 // save time in seconds
                summaryAndImpacts = JSON.parse(summaryAndImpacts)
                if (isString(summaryAndImpacts)) {
                    summaryAndImpacts = JSON.parse(summaryAndImpacts)
                }

                data.summary = summaryAndImpacts?.result?.summary ?? ''
                data.key_points = summaryAndImpacts?.result?.key_points ?? []
                data.impacts = normalizeAndParse(
                    summaryAndImpacts?.result?.impacts
                )
                data.response_time = scriptDurationTime
                if (summaryAndImpacts?.code_interpreter === 'True') {
                    data.code_interpreter = summaryAndImpacts?.code_interpreter
                    data.assistant_id_code =
                        summaryAndImpacts?.assistant_id_code
                }

                updateData = true
            }

            if (updateData) {
                await BillVersionModel.update({
                    params: {
                        bill_version_id: data?.bill_version_id,
                    },
                    body: {
                        ...data,
                    },
                })
            }
            // eslint-disable-next-line no-console
            console.log('------ Generate bill summary job is completed ------')

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                '------ Generate bill summary job is aborted ------',
                error
            )

            Sentry.captureException(error)

            done(error)
        }
    })
}
