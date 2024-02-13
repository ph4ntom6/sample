import { Op } from 'sequelize'

import { omit } from 'lodash'

import { UserModel } from '../../models'

/**
 * @description This method will list all the users
 */
export const get = async (request, response) => {
    const {
        query: { keyword, status, roleTitle, businessId },
    } = request
    const { user } = request

    const where = {}

    if (status) {
        where.status = status
    }

    if (roleTitle) {
        where.role_title = roleTitle
    }

    if (businessId) {
        where.business_id = businessId
        if (user?.role_title === 'Admin') {
            where.business_id = user?.business_id
        }
    }

    if (keyword?.trim()) {
        where.full_name = {
            [Op.like]: `%${keyword}%`,
        }
    }

    const data = await UserModel.paginate(request, {
        where,
    })
    const removeFields = ['verification_code', 'password_token', 'password']
    for (let i = 0; i < data.length; i++) {
        data[i] = omit(JSON.parse(JSON.stringify(data[i])), removeFields)
    }

    response.json({
        data,
    })
}
