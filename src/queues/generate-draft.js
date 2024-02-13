import * as Sentry from '@sentry/node'

import dotenv from 'dotenv'
import { col } from 'sequelize'
// eslint-disable-next-line import/no-extraneous-dependencies
import markdownit from 'markdown-it'

import exec from '../helpers/exec'
import generateAssistantId from '../helpers/generate-assistant-id'
// import generatePdfFileName from '../helpers/generate-pdf-file-name'
// import path from 'path'

import { BillVersionModel, BillModel, DraftModel } from '../models'

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

const md = markdownit({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
})

export default (generateDraftQueue) => {
    generateDraftQueue.process(3, async (job, done) => {
        // eslint-disable-next-line no-console
        console.log('------ Generate bill draft job is in progress ------')

        try {
            const {
                data: { payload /* bill_version_id */, id },
            } = job
            /* find bill's latest version assistant_id */
            const billVersion = await BillModel.findOne({
                where: {
                    bill_id: payload?.bill_id,
                },
                include: {
                    model: BillVersionModel,
                    as: 'version',
                    where: { bill_id: payload?.bill_id },
                    attributes: [],
                },
                attributes: [
                    'bill_id',
                    'bill_num',
                    [col('version.assistant_id'), 'assistant_id'],
                    [col('version.bill_version_id'), 'bill_version_id'],
                    [col('version.version_num'), 'version_num'],
                    [col('version.subject'), 'subject'],
                    [col('version.code_interpreter'), 'code_interpreter'],
                    [col('version.assistant_id_code'), 'assistant_id_code'],
                ],
                raw: true,
            })

            // const fileName = generatePdfFileName(billVersion)
            // const filePath = path.join(
            //     __dirname,
            //     '..',
            //     '..',
            //     'storage',
            //     'bill-pdfs',
            //     fileName
            // )

            /* if assistant_id is not present, then generate assistant_id, */
            if (billVersion && !billVersion?.assistant_id) {
                const assistantId = await generateAssistantId(billVersion)
                if (assistantId) {
                    billVersion.assistant_id = assistantId
                    await BillVersionModel.update({
                        params: {
                            bill_version_id: billVersion?.bill_version_id,
                        },
                        body: {
                            assistant_id: assistantId,
                        },
                    })
                }
            }
            const scriptStartTime = Date.now()
            const output = await exec(
                [
                    '--input',
                    `{ "file_id": "${
                        billVersion?.assistant_id
                    }", "clients": ${JSON.stringify(
                        payload?.clients
                    )}, "address_to": "${payload?.send_to}", "tone": "${
                        payload?.writing_style?.tone !== ''
                            ? payload?.writing_style?.tone
                            : 'formal'
                    }", "style": "${
                        payload?.writing_style?.style !== ''
                            ? payload?.writing_style?.style
                            : 'academic'
                    }", "length": "${
                        payload?.writing_style?.length !== ''
                            ? payload?.writing_style?.length
                            : 'medium'
                    }", "template": "${
                        payload?.writing_style?.template !== ''
                            ? payload?.writing_style?.template
                            : 'default'
                    }", "talking_points": "${
                        payload?.talking_points &&
                        payload?.talking_points?.length
                            ? payload?.talking_points.toString()
                            : ''
                    }", "user_stance": "${payload?.stance}", "bill_name": "${
                        billVersion?.bill_num
                    } ${billVersion?.subject ?? ''}"}`,
                ],
                'scripts/letter_drafting_pipleine.py'
            )
            const scriptEndTime = Date.now()
            const scriptDurationTime = (scriptEndTime - scriptStartTime) / 1000 // save time in seconds
            const response = JSON.parse(output)

            if (!response?.result) {
                throw new Error('Result is empty, retry the queue')
            }

            /* convert markdown to html */
            response.result = md.render(response?.result)

            if (response?.code_interpreter === 'True') {
                await BillVersionModel.update({
                    params: {
                        bill_version_id: billVersion?.bill_version_id,
                    },
                    body: {
                        code_interpreter: response?.code_interpreter,
                        assistant_id_code: response?.assistant_id_code,
                    },
                })
            }

            await DraftModel.update({
                params: { id },
                body: {
                    output: response?.result,
                    is_processing: false,
                    response_time: scriptDurationTime,
                },
            })

            // eslint-disable-next-line no-console
            console.log('------ Generate bill draft job is completed ------')

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(
                '------ Generate bill draft job is aborted ------',
                error
            )

            Sentry.captureException(error)

            done(error)
        }
    })
}
