const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const downloadFolderPath = path.join(
            __dirname,
            '/../storage/bills-pdfs/'
        )
        const filename = '20230AB192CHP.pdf'

        const browser = await puppeteer.launch({
            headless: 'new',
            browserContextOptions: {
                download: {
                    defaultPath: downloadFolderPath,
                },
            },
        })

        const page = await browser.newPage()

        const url =
            'https://leginfo.legislature.ca.gov/faces/billPdf.xhtml?bill_id=202320240AB1&version=20230AB192CHP'
        await page.goto(url)

        const downloadPromise = new Promise(async (resolve, reject) => {
            page.on('download', async (download) => {
                try {
                    const downloadedFilePath = await download.path()
                    console.log(`File downloaded to: ${downloadedFilePath}`)

                    const newFilePath = path.join(downloadFolderPath, filename)
                    await fs.rename(downloadedFilePath, newFilePath)
                    console.log(`File moved to: ${newFilePath}`)

                    resolve()
                } catch (error) {
                    reject(error)
                }
            })
        })

        await downloadPromise
        await browser.close()
    },
    down: async (queryInterface, Sequelize) => {},
}
