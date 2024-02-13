import { get } from './get'

import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'
import authenticate from '../../middlewares/authenticate'
import { validateEnum } from '../../validators/enum'

module.exports = {
    '/:slug': {
        get: {
            middlewares: [
                authenticate,
                validateEnum(
                    'slug',
                    [
                        'measure_type',
                        'current_house',
                        'measure_state',
                        'session_year',
                        'current_status',
                        'code',
                    ],
                    true
                ),
                validationResponse,
            ],
            action: asyncHandler(get),
        },
    },
}
