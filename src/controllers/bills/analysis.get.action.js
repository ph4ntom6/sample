import { BillAnalysisModel } from '../../models'

/**  Bills Analysis
 * @description The function will return the list of bills Analysis
 * @input bill_id
 * @return (Object)
 */
export const getAnalysis = async (request, response) => {
    const {
        params: { id },
    } = request

    request.query.orderBy = 'analysis_id'
    request.query.attributes =
        request.query.attributes ?? 'committee_name,analysis_date,source_doc'

    const data = await BillAnalysisModel.paginate(request, {
        where: {
            bill_id: id,
        },
    })

    response.json({
        data,
    })
}
