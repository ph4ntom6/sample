/* eslint-disable babel/camelcase */
/* eslint-disable camelcase */
import { col, literal, fn } from 'sequelize'

import {
    BillMotionModel,
    LocationCodeModel,
    BillDetailVoteModel,
    BillSummaryVoteModel,
} from '../../models'

/** View bill's vote summary
 * @description The function will return bill's vote for a specific session
 * @input id
 * @return (Object)
 */
export const viewVoteSummary = async (request, response) => {
    const {
        params: { id },
        query: { vote_date_time, location_code, motion_id, vote_date_seq },
    } = request

    const updatedVoteDate = new Date(vote_date_time).toISOString()

    /* query the database to retrieve data */
    const data = await BillSummaryVoteModel.findOne({
        where: {
            bill_id: id,
            location_code,
            vote_date_time: literal(`'${updatedVoteDate}'`),
            vote_date_seq,
            motion_id,
        },
        include: [
            {
                model: BillDetailVoteModel,
                as: 'bill_detail_votes',
                where: {
                    bill_id: id,
                    motion_id,
                    vote_date_time: literal(`'${updatedVoteDate}'`),
                },
                attributes: [],
                required: false,
            },
            {
                model: BillMotionModel,
                as: 'bill_motions',
                attributes: [],
                required: false,
            },
            {
                model: LocationCodeModel,
                attributes: [],
                required: false,
                as: 'location_codes',
            },
        ],
        attributes: [
            'ayes',
            'noes',
            'abstain',
            'vote_date_time',
            'vote_result',
            [col('location_codes.description'), 'location'],
            [col('bill_motions.motion_text'), 'motionText'],
            [
                fn(
                    'GROUP_CONCAT',
                    literal(
                        "DISTINCT CASE WHEN `bill_detail_votes`.`vote_code` = 'AYE' THEN `bill_detail_votes`.`legislator_name` END"
                    )
                ),
                'ayesLegislators',
            ],
            [
                fn(
                    'GROUP_CONCAT',
                    literal(
                        "DISTINCT CASE WHEN `bill_detail_votes`.`vote_code` = 'NOE' THEN `bill_detail_votes`.`legislator_name` END"
                    )
                ),
                'noesLegislators',
            ],
            [
                fn(
                    'GROUP_CONCAT',
                    literal(
                        "DISTINCT CASE WHEN `bill_detail_votes`.`vote_code` = 'ABS' THEN `bill_detail_votes`.`legislator_name` END"
                    )
                ),
                'abstainLegislators',
            ],
        ],
        group: [
            'description',
            'vote_result',
            'vote_date_time',
            'ayes',
            'noes',
            'abstain',
        ],
        raw: true,
    })

    response.json({
        data,
    })
}
