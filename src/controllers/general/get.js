import { BillModel, CodeModel } from '../../models'

/**  Fetch filter option for Bills
 * @description The function will return the list of  measure_type , chamber, status, session, code
 * @input slug
 * @return list
 */
export const get = async (request, response) => {
    const {
        params: { slug },
    } = request
    let group = []
    const attributes = [slug]
    let model = null

    if (slug === 'code') {
        model = CodeModel
        attributes.push('title')
    } else {
        model = BillModel
        group = [slug]
    }

    let data = await model.findAll({
        attributes,
        group,
        raw: true,
    })
    data = data.map((item) => {
        if (slug === 'code') {
            const lastIndexOfDash = item.title.lastIndexOf(' - ')
            if (lastIndexOfDash !== -1) {
                item.title = item?.title.substring(0, lastIndexOfDash)
            }
            return item
        } else {
            if (slug === 'session_year') {
                return {
                    session_year: `${item[slug].slice(0, 4)} - ${item[
                        slug
                    ].slice(4)}`,
                }
            } else {
                return item
            }
        }
    })

    response.json({
        data,
    })
}
