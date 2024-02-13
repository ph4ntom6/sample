import { IncomingWebhook } from '@slack/webhook'

import { isEmpty, isString } from 'lodash'

const createCodeBlock = (title, code) => {
    if (isEmpty(code)) {
        return ''
    }
    code = isString(code) ? code.trim() : JSON.stringify(code, null, 2)

    const tripleBackticks = '```'

    return '_' + title + '_' + tripleBackticks + code + tripleBackticks + '\n'
}

export default async (error, request, response, next) => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL

    if (webhookUrl) {
        try {
            const slack = new IncomingWebhook(webhookUrl)

            const attachment = {
                fallback: error.name + ': ' + error.message,
                title: error.name + ': ' + error.message,
                text: [
                    {
                        title: 'Stack trace:',
                        code: error.stack,
                    },
                    {
                        title: 'Request',
                        code: {
                            method: request.method,
                            url: request.url,
                            headers: request.headers,
                            query: request.query,
                            body: request.body || {},
                        },
                    },
                ]
                    .map((data) => {
                        return createCodeBlock(data.title, data.code)
                    })
                    .join(''),
                mrkdwn_in: ['text'],
                footer: process.env.APP_NAME,
                ts: parseInt(Date.now() / 1000),
            }

            await slack.send({
                username: process.env.APP_NAME,
                channel: process.env.SLACK_CHANNEL,
                icon_emoji: ':ghost:',
                attachments: [attachment],
            })
        } catch (exception) {
            // eslint-disable-next-line
            console.log('exception in slack handler', exception)
        }
    }

    return next(error, request, response, next)
}
