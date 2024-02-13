import * as Sentry from '@sentry/node'

import dotenv from 'dotenv'

import exec from '../helpers/exec'

import {
    ConversationMessageModel,
    ConversationModel,
    BillVersionModel,
} from '../models'
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

export default (messageQueue) => {
    messageQueue.process(1, async (job, done) => {
        // eslint-disable-next-line no-console
        console.log('------ Message job is in progress ------', job?.data)

        try {
            const {
                data: { data, conversation, bill },
            } = job
            // const fileName = generatePdfFileName(bill?.version)
            // const filePath = path.join(
            //     __dirname,
            //     '..',
            //     '..',
            //     'storage',
            //     'bill-pdfs',
            //     fileName
            // )
            const scriptStartTime = Date.now()
            let response = await exec(
                [
                    '--input',
                    `{ "thread_id": "${
                        conversation?.thread_id ?? 'None'
                    }", "file_id": "${
                        conversation?.assistant_id
                    }", "user_input": "${data[0]?.message}" }`,
                ],
                'scripts/knowledge_assist.py'
            )
            const scriptEndTime = Date.now()
            const scriptDurationTime = (scriptEndTime - scriptStartTime) / 1000 // save time in seconds
            response = JSON.parse(response)
            if (response?.code_interpreter === 'True') {
                await BillVersionModel.update({
                    params: {
                        bill_version_id: bill?.version?.bill_version_id,
                    },
                    body: {
                        code_interpreter: response?.code_interpreter,
                        assistant_id_code: response?.assistant_id_code,
                    },
                })
            }
            ConversationMessageModel.updateByPk(data[1]?.id, {
                body: {
                    message: response?.result,
                    // source: response?.chunk,
                    response_time: scriptDurationTime,
                },
            })

            if (!conversation?.thread_id) {
                ConversationModel.update({
                    params: {
                        id: conversation?.id,
                    },
                    body: {
                        thread_id: response?.thread_id,
                    },
                })
            }

            // eslint-disable-next-line no-console
            console.log('------ Message job is completed ------')

            done()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('------ Message job is aborted ------', error)

            Sentry.captureException(error)

            done(error)
        }
    })
}
