/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import Queue from 'bull'
import bullConfig from '../../config/bull'

import { col, literal } from 'sequelize'
import {
    BillModel,
    BillVersionModel,
    UserBillTrackingModel,
} from '../../models'

import translate from '../../helpers/translate'

import AppValidationError from '../../exceptions/AppValidationError'
import generatePdfFileName from '../../helpers/generate-pdf-file-name'

const generateBillSummaryQueue = new Queue(
    'Generate Bill Summary Queue',
    bullConfig
)

/** View Bill
 * @description The function will return the bill
 * @input id
 * @return (Object)
 */
export const view = async (request, response) => {
    const {
        params: { id },
        query: { bill_version_id },
        user,
    } = request

    /* Set up the WHERE condition to find the bill with the given ID */
    let where = {
        bill_id: id,
    }
    let generateSummary = false
    if (bill_version_id) {
        where.bill_version_id = bill_version_id
    } else {
        generateSummary = true
        where = {
            ...where,
            [literal('bill_version_id')]: col(
                '`bill`.`latest_bill_version_id`'
            ),
        }
    }

    /* Fetch the data for the specified bill ID, including versions, authors, and codes */
    let data = await BillVersionModel.findOne({
        where,
        include: [
            {
                model: BillModel,
                as: 'bill',
                attributes: [],
            },
        ],
        attributes: [
            'bill_id',
            'subject',
            'summary',
            'impacts',
            'key_points',
            [col('bill_html'), 'content'],
            'version_num',
            'bill_version_action_date',
            'bill_version_id',
            'assistant_id',
            [col('bill.measure_num'), 'measure_num'],
            [col('bill.current_status'), 'current_status'],
            [col('bill.measure_type'), 'measure_type'],
            [col('bill.measure_state'), 'measure_state'],
            [col('bill.session_year'), 'session_year'],
            [col('bill.trans_update'), 'trans_update'],
            [col('bill.latest_bill_version_id'), 'latest_bill_version_id'],
        ],
        group: ['bill_version_id'],
        subQuery: false,
        raw: true,
    })

    if (!data) {
        throw new AppValidationError(
            translate('validations', 'notFound', {
                ':attribute': 'Bill',
            }),
            404
        )
    }

    data.pdf_file_path = `/storage/bill-pdfs/${generatePdfFileName(data)}`
    const bill_followed = await UserBillTrackingModel.findOne({
        where: {
            bill_id: id,
            user_id: user?.id,
            business_id: user?.business_id,
        },
        attributes: ['id'],
    })

    if (bill_followed) {
        data = { ...data, bill_followed: !!bill_followed }
    }

    if (
        generateSummary &&
        !data?.summary &&
        !data?.impacts &&
        !data?.key_points
    ) {
        /* add queue for summary generation */
        await generateBillSummaryQueue.add(
            { bill_version_id: data?.latest_bill_version_id },
            {
                removeOnComplete: true,
            }
        )
    }

    response.json({
        data,
    })
}
