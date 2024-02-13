import { create } from './create.action'
import authenticate from '../../middlewares/authenticate'

/** Middleware functions */
import { validate } from '../../validators/business'

import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'

module.exports = {
    '/': {
        post: {
            middlewares: [
                authenticate,
                validate({
                    field: 'status',
                    isRequired: false,
                    values: ['active', 'blocked'],
                }),
                validate({ field: 'title', max: 50 }),
                validate({ field: 'description', max: 200 }),
                validate({ field: 'contact_info' }),
                validate({ field: 'contact_info.address' }),
                validate({ field: 'contact_info.number' }),
                validate({ field: 'contact_info.name' }),
                validate({ field: 'contact_info.email' }),
                validationResponse,
            ],
            action: asyncHandler(create),
        },
    },
    '/:id': {
        put: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({
                    field: 'status',
                    isRequired: false,
                    values: ['active', 'blocked'],
                }),
                validate({ field: 'title', isRequired: false, max: 50 }),
                validate({ field: 'description', isRequired: false, max: 200 }),
                validate({ field: 'contact_info', isRequired: false }),
                validate({ field: 'contact_info.address', isRequired: false }),
                validate({ field: 'contact_info.number', isRequired: false }),
                validate({ field: 'contact_info.name', isRequired: false }),
                validate({ field: 'contact_info.email', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(create),
        },
    },
}
