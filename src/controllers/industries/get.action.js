import { IndustryModel } from '../../models'

/**
 * @description  a function that will get all the industries
 * @param {*}
 * @returns data
 */
export const get = async (request, response) => {
    const where = {}
    const { title } = request.query

    /** add condition for title filter */
    if (title) {
        where.title = title
    }

    /** get specific attributes */
    request.query.attributes = 'id,title'

    /** get data from industries with pagination */
    const data = await IndustryModel.paginate(request, { where })
    return response.json({
        data,
    })
}
