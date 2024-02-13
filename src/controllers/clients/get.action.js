import { Op } from 'sequelize'
import { isString } from 'lodash'
import { ClientModel } from '../../models'

/**
 * @description  a function that will get all the client data
 * @param {*}
 * @returns data
 */
export const get = async (request, response) => {
    const {
        query: { keyword, status, count = false },
    } = request
    let where = {}
    if (status) {
        where.status = status
    }

    if (keyword?.trim() && isString(keyword?.trim())) {
        where = {
            ...where,
            [Op.or]: [
                {
                    client_name: {
                        [Op.like]: `%${keyword}%`,
                    },
                },
                {
                    industry_title: {
                        [Op.like]: `%${keyword}%`,
                    },
                },
            ],
        }
    }
    request.query.attributes =
        request.query.attributes ??
        'id,client_name,industry_title,status,updatedAt'
    let data = []
    if (!count) {
        data = await ClientModel.paginate(request, { where })
    } else {
        data = await ClientModel.count({
            where,
            group: ['status'],
            raw: true,
        })
    }

    response.json({
        data,
    })
}
