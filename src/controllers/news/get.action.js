import { NewsModel } from '../../models'

/**
 * @description  a function that will get all the news
 * @param {*}
 * @returns data
 */
export const get = async (request, response) => {
    request.query.attributes = 'data'
    request.query.order = 'DESC'
    request.query.orderBy = 'created_at'

    let data = await NewsModel.paginate(request)

    data = data.map((item) => item.data)

    response.json({
        data,
    })
}
