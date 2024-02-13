import * as Sentry from '@sentry/node'

import source from './data/news-source'

const axios = require('axios')
const cheerio = require('cheerio')
const dayjs = require('dayjs')

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

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            const response = await axios.get('https://www.rtumble.com/')
            const $ = cheerio.load(response.data)

            const resultArray = []

            $('p').each((index, element) => {
                const title = $(element).find('span.position').text()
                const dateIndex = $(element).text().lastIndexOf('$ -- ')
                let date = ''
                if (dateIndex !== -1) {
                    date = $(element)
                        .text()
                        .substring(dateIndex + 5)
                        .trim()
                }
                let newDate = null
                if (date !== '') {
                    newDate = dayjs(date).format('MM-DD-YYYY')
                }

                const link = $(element).find('a').attr('href')

                if (title && date && link) {
                    resultArray.push({
                        source_id: source[0]?.id,
                        source_name: source[0]?.name,
                        data: JSON.stringify({
                            title: title,
                            link: link,
                            date: newDate,
                        }),
                        created_at: new Date(),
                        updated_at: new Date(),
                    })
                }
            })

            if (resultArray.length > 0) {
                await queryInterface.bulkDelete('news', null, {})

                await queryInterface.bulkInsert('news', resultArray, {
                    ignoreDuplicate: true,
                })
            }
        } catch (error) {
            // submit error to sentry
            Sentry.captureException(error)
        }
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('news', null, {})
    },
}
