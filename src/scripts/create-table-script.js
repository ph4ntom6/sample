import execute from '../helpers/execute'
import { promises as fs } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

async function runScript() {
    try {
        // eslint-disable-next-line no-console
        console.log('---------- Script execution started ------------')
        const currentDir = __dirname

        // Provide execute permission to the script
        await fs.chmod(`${currentDir}/create-table.sh`, '755')

        const command = `${currentDir}/../../scripts/./create-table.sh ${process.env.MYSQL_DB_PASSWORD}`

        const output = await execute(command)

        // eslint-disable-next-line no-console
        console.log(`---------- Script execution done ------------${output}`)
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`---------- Script execution aborted ------------${error}`)
    }
}

runScript()
