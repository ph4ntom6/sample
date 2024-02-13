import { ClientScorecardModel } from '../../models'
import translate from '../../helpers/translate'
// eslint-disable-next-line import/no-extraneous-dependencies
import { HTMLToJSON } from 'html-to-json-parser'
import * as cheerio from 'cheerio'

/**
 * @description  a function that will create/update client score card data
 * @param {*}
 * @returns message
 */
export const updateScorecard = async (request, response) => {
    const {
        params: { id },
        body: { value },
    } = request

    const html = `<div>${value}</div>`
    const $ = await cheerio.load(html)
    $('img').each((index, element) => {
        $(element).attr(
            'style',
            'width: 20px; height: 20px; position: relative; top: 3px; right: 5px'
        )
    })
    const modifiedHtml = $.html()
    const json = await HTMLToJSON(modifiedHtml, true)
    await ClientScorecardModel.update({
        params: {
            client_id: id,
        },
        body: {
            value: json,
        },
    })

    return response.json({
        message: translate('messages', 'success', {
            ':attribute': 'Client score card has',
            ':action': 'updated',
        }),
        data: modifiedHtml,
    })
}
