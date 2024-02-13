// eslint-disable-next-line import/no-unresolved
import { parse } from 'csv-parse/sync'

import path from 'path'
import { Op } from 'sequelize'
import dayjs from '../helpers/dayjs'
import sendSlackNotification from '../helpers/slack-helper'

import { readFileSync, existsSync, readdirSync, unlinkSync } from 'fs'
import sequelize, {
    BillAnalysisModel,
    BillDetailVoteModel,
    BillHistoryModel,
    BillModel,
    BillMotionModel,
    BillSummaryVoteModel,
    BillVersionAuthorModel,
    BillVersionModel,
    CodeModel,
    CommitteeAgendaModel,
    CommitteeHearingModel,
    DailyFileModel,
    LegislatorModel,
    LocationCodeModel,
    VetoMessageModel,
    NotificationLockModel,
} from '../models/'

const currentDirectory = __dirname
const errorMessages = []
const successMessages = []

const parseValue = (value, context) => {
    if (value?.endsWith('.lob')) {
        if (existsSync(`${currentDirectory}/data/${value}`)) {
            const blob = readFileSync(`${currentDirectory}/data/${value}`)

            unlinkSync(`${currentDirectory}/data/${value}`)

            return Buffer.from(blob).toString('utf8')
        } else {
            const error = `File referenced but does not exist: ${currentDirectory}/data/${value}`
            // eslint-disable-next-line no-console
            console.error(error)
            errorMessages.push(error)
        }
    } else if (value === 'NULL') {
        return null
    }

    return value
}

const filesWithExtension = (extension) => {
    const files = readdirSync(`${currentDirectory}/data/`)

    // Filter files with the specified extension
    const datFiles = files.filter(
        (file) => path.extname(file) === `.${extension}`
    )

    // Return the files with the specified extension
    return datFiles
}

const sendStatusSlackNotification = async (codeBlock) => {
    const now = dayjs()

    const notificationExist = await NotificationLockModel.findOne({
        where: {
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('DATE', sequelize.col('created_at')),
                    {
                        [Op['eq']]: dayjs(now).format('YYYY-MM-DD'),
                    }
                ),
                { title: 'seed-data-script' },
            ],
        },
    })

    if (!notificationExist) {
        const files = filesWithExtension('dat')

        let notification = `Seed Data Update Summary:\n`

        const total = successMessages?.length + files?.length
        let successPercent = 0
        let errorPercent = 0

        if (successMessages?.length) {
            notification += `✅ Successfully inserted ${successMessages?.length} files into the database.\n\n`
            successPercent = (successMessages?.length / total).toFixed(2) * 100
            notification += successMessages
                .map((message) => `✅ ${message}\n`)
                .join('\n')
        }
        if (files?.length) {
            notification += `❌ ${files?.length} files encountered issues and were not inserted. Please review and address the errors.\n\n`
            errorPercent = (files?.length / total).toFixed(2) * 100
            notification += files
                .map((file) => `❌ Error inserting file ${file}\n\n`)
                .join('\n')
        }

        notification += errorMessages
            .map((message) => `❌ ${message}\n\n`)
            .join('\n')

        await sendSlackNotification({
            title: 'Seed Data Script Data Status',
            notification,
            codeBlock,
            allowChart: !!(successPercent || errorPercent),
            successPercent,
            errorPercent,
        })
        await NotificationLockModel.create({
            body: { title: 'seed-data-script' },
        })
        for (const file of files) {
            unlinkSync(`${currentDirectory}/data/${file}`)
        }
    }
}

const loadDataFile = async (datFilePath, model, columns) => {
    if (existsSync(`${currentDirectory}/data/${datFilePath}`)) {
        const data = readFileSync(
            `${currentDirectory}/data/${datFilePath}`,
            'utf8'
        )

        const rows = parse(data, {
            columns,
            quote: '`',
            delimiter: '\t',
            cast: parseValue,
        })

        await sequelize.queryInterface.bulkInsert(model.getTableName(), rows, {
            updateOnDuplicate: columns,
        })

        successMessages.push(
            `Model ${model?.getTableName()} updated successfully from ${datFilePath} file updating ${
                rows?.length
            } records at ${dayjs()}`
        )
        unlinkSync(`${currentDirectory}/data/${datFilePath}`)
    } else {
        // eslint-disable-next-line no-console
        console.log(`File not found: ${currentDirectory}/data/${datFilePath}`)
    }
}

export const seedData = async () => {
    try {
        if (existsSync(`${currentDirectory}/data`)) {
            const dataFiles = [
                {
                    fileName: 'BILL_VERSION_TBL.dat',
                    model: BillVersionModel,
                    columns: [
                        'bill_version_id',
                        'bill_id',
                        'version_num',
                        'bill_version_action_date',
                        'bill_version_action',
                        'request_num',
                        'subject',
                        'vote_required',
                        'appropriation',
                        'fiscal_committee',
                        'local_program',
                        'substantive_changes',
                        'urgency',
                        'taxlevy',
                        'bill_xml',
                        'active_flg',
                        'trans_uid',
                        'trans_update',
                    ],
                },
                {
                    fileName: 'BILL_ANALYSIS_TBL.dat',
                    model: BillAnalysisModel,
                    columns: [
                        'analysis_id',
                        'bill_id',
                        'house',
                        'analysis_type',
                        'committee_code',
                        'committee_name',
                        'amendment_author',
                        'analysis_date',
                        'amendment_date',
                        'page_num',
                        'source_doc',
                        'released_floor',
                        'active_flg',
                        'trans_uid',
                        'trans_update',
                    ],
                },
                {
                    fileName: 'BILL_DETAIL_VOTE_TBL.dat',
                    model: BillDetailVoteModel,
                    columns: [
                        'bill_id',
                        'location_code',
                        'legislator_name',
                        'vote_date_time',
                        'vote_date_seq',
                        'vote_code',
                        'motion_id',
                        'trans_uid',
                        'trans_update',
                        'member_order',
                        'session_date',
                        'speaker',
                    ],
                },
                {
                    fileName: 'BILL_HISTORY_TBL.dat',
                    model: BillHistoryModel,
                    columns: [
                        'bill_id',
                        'bill_history_id',
                        'action_date',
                        'action',
                        'trans_uid',
                        'trans_update_dt',
                        'action_sequence',
                        'action_code',
                        'action_status',
                        'primary_location',
                        'secondary_location',
                        'ternary_location',
                        'end_status',
                    ],
                },
                {
                    fileName: 'BILL_MOTION_TBL.dat',
                    model: BillMotionModel,
                    columns: [
                        'motion_id',
                        'motion_text',
                        'trans_uid',
                        'trans_update',
                    ],
                },
                {
                    fileName: 'BILL_SUMMARY_VOTE_TBL.dat',
                    model: BillSummaryVoteModel,
                    columns: [
                        'bill_id',
                        'location_code',
                        'vote_date_time',
                        'vote_date_seq',
                        'motion_id',
                        'ayes',
                        'noes',
                        'abstain',
                        'vote_result',
                        'trans_uid',
                        'trans_update',
                        'file_item_num',
                        'file_location',
                        'display_lines',
                        'session_date',
                    ],
                },
                {
                    fileName: 'BILL_TBL.dat',
                    model: BillModel,
                    columns: [
                        'bill_id',
                        'session_year',
                        'session_num',
                        'measure_type',
                        'measure_num',
                        'measure_state',
                        'chapter_year',
                        'chapter_type',
                        'chapter_session_num',
                        'chapter_num',
                        'latest_bill_version_id',
                        'active_flg',
                        'trans_uid',
                        'trans_update',
                        'current_location',
                        'current_secondary_loc',
                        'current_house',
                        'current_status',
                        'days_31st_in_print',
                    ],
                },
                {
                    fileName: 'BILL_VERSION_AUTHORS_TBL.dat',
                    model: BillVersionAuthorModel,
                    columns: [
                        'bill_version_id',
                        'type',
                        'house',
                        'name',
                        'contribution',
                        'committee_members',
                        'active_flg',
                        'trans_uid',
                        'trans_update',
                        'primary_author_flg',
                    ],
                },
                {
                    fileName: 'CODES_TBL.dat',
                    model: CodeModel,
                    columns: ['code', 'title'],
                },
                {
                    fileName: 'COMMITTEE_AGENDA_TBL.dat',
                    model: CommitteeAgendaModel,
                    columns: [
                        'committee_code',
                        'committee_desc',
                        'agenda_date',
                        'agenda_time',
                        'line1',
                        'line2',
                        'line3',
                        'building_type',
                        'room_num',
                    ],
                },
                {
                    fileName: 'COMMITTEE_HEARING_TBL.dat',
                    model: CommitteeHearingModel,
                    columns: [
                        'bill_id',
                        'committee_type',
                        'committee_nr',
                        'hearing_date',
                        'location_code',
                        'trans_uid',
                        'trans_update_date',
                    ],
                },
                {
                    fileName: 'DAILY_FILE_TBL.dat',
                    model: DailyFileModel,
                    columns: [
                        'bill_id',
                        'location_code',
                        'consent_calendar_code',
                        'file_location',
                        'publication_date',
                        'floor_manager',
                        'trans_uid',
                        'trans_update_date',
                        'session_num',
                        'status',
                    ],
                },
                {
                    fileName: 'LEGISLATOR_TBL.dat',
                    model: LegislatorModel,
                    columns: [
                        'district',
                        'session_year',
                        'legislator_name',
                        'house_type',
                        'author_name',
                        'first_name',
                        'last_name',
                        'middle_initial',
                        'name_suffix',
                        'name_title',
                        'web_name_title',
                        'party',
                        'active_flg',
                        'trans_uid',
                        'trans_update',
                        'active_legislator',
                    ],
                },
                {
                    fileName: 'LOCATION_CODE_TBL.dat',
                    model: LocationCodeModel,
                    columns: [
                        'session_year',
                        'location_code',
                        'location_type',
                        'consent_calendar_code',
                        'description',
                        'long_description',
                        'active_flg',
                        'trans_uid',
                        'trans_update',
                        'inactive_file_flg',
                    ],
                },
                {
                    fileName: 'VETO_MESSAGE_TBL.dat',
                    model: VetoMessageModel,
                    columns: [
                        'bill_id',
                        'veto_date',
                        'message',
                        'trans_uid',
                        'trans_update',
                    ],
                },
            ]

            for (let i = 0; i < dataFiles.length; i++) {
                await loadDataFile(
                    dataFiles[i].fileName,
                    dataFiles[i].model,
                    dataFiles[i].columns
                )
            }

            sendStatusSlackNotification(null)
        } else {
            // eslint-disable-next-line no-console
            console.log(
                '----------- DATA DIRECTORY DOES NOT EXIST --------------------- '
            )
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`--------- Seed Data Script is aborted -----${error}`)

        sendStatusSlackNotification(error)
    }
}

if (require.main === module) {
    seedData()
}
