import { list } from './list.action'
import { markAsRead } from './update.action'
import { generateAlerts } from './generate.action'
import { validate } from '../../validators/alert'

import authenticate from '../../middlewares/authenticate'
import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'

module.exports = {
    '/': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'status', isRequired: false }),
                validate({ field: 'client_ids', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(list),
        },
    },
    '/:id/mark-as-read': {
        post: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(markAsRead),
        },
    },
    '/generate-alert': {
        post: {
            middlewares: [authenticate, validationResponse],
            action: asyncHandler(generateAlerts),
        },
    },
}
