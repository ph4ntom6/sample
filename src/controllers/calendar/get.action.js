import { CalendarModel } from '../../models'
import { omit } from 'lodash'
import { Op } from 'sequelize'

/**
 * @description a function that will get all the calendar data
 * @param {*}
 * @returns data
 */
export const get = async (request, response) => {
    const where = {}

    const {
        query: { type },
    } = request

    if (type === 'upcoming') {
        // Define Sequelize where clause: start_date > currentDate
        where.start_date = {
            [Op.gte]: new Date(), // Use Sequelize Op to specify the greater than or equal to condition
        }
    }

    const data = await CalendarModel.paginate(request, {
        where,
    })

    const removeFields = ['createdAt', 'updatedAt']

    /* remove specific fields */
    for (let i = 0; i < data.length; i++) {
        data[i] = omit(JSON.parse(JSON.stringify(data[i])), removeFields)
    }

    return response.json({
        data,
    })
}
