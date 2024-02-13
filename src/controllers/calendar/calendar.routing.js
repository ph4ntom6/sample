import { get } from './get.action'
import authenticate from '../../middlewares/authenticate'

/** Middleware functions */

import { asyncHandler } from '../../middlewares/exception-handler'

module.exports = {
    '/': {
        get: {
            middlewares: [authenticate],
            action: asyncHandler(get),
        },
    },
}
