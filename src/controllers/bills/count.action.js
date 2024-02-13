import { BillModel } from '../../models'

/**  Bill count
 * @description The function will return the number of bills
 * * @input none
 * @return (Object)
 */
export const count = async (request, response) => {
    const data = await BillModel.count()

    response.json({
        data,
    })
}
