import { request } from './request.action'
import { set } from './set.action'
import { validate } from './validate.action'
import { validate as validator } from '../../middlewares/validator'
import validationResponse from '../../middlewares/validation-response'
import { asyncHandler } from '../../middlewares/exception-handler'

module.exports = {
    '/request': {
        post: {
            middlewares: [validator('email'), validationResponse],
            action: asyncHandler(request),
        },
    },
    '/set/:passwordToken': {
        put: {
            middlewares: [
                validator('password'),
                validator('confirmPassword'),
                validationResponse,
            ],
            action: asyncHandler(set),
        },
    },
    '/validate/:passwordToken': {
        get: {
            action: asyncHandler(validate),
        },
    },
}
