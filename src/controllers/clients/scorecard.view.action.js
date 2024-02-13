import { replace } from 'lodash'

import { ClientScorecardModel } from '../../models'

// eslint-disable-next-line import/no-extraneous-dependencies
import { JSONToHTML } from 'html-to-json-parser'

/* Get client scorecard
 * @description This method will fetch a single record of client's scorecard
 * @input id
 * @return (Object)
 */
export const viewScorecard = async (request, response) => {
    const {
        params: { id },
    } = request
    const data = await ClientScorecardModel.findOne({
        where: { client_id: id },
        attributes: ['id', 'value'],
    })

    if (data?.value) {
        let json = data?.value
        json = replace(json, /\\n/g, '')
        const html = await JSONToHTML(json, true)
        data.value = html
    }

    /* send response */
    response.json({
        data,
    })
}
