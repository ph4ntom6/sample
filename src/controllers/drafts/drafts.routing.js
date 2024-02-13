import { get } from './get.action'
import { view } from './view.action'
import { create } from './create.action'
import { remove } from './remove.action'
import { update } from './update.action'

import { validate } from '../../validators/draft'

import authenticate from '../../middlewares/authenticate'
import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'

module.exports = {
    '/': {
        post: {
            middlewares: [
                authenticate,
                validate({ field: 'bill_id' }),
                validate({ field: 'clients' }),
                validate({
                    field: 'stance',
                    values: [
                        'support',
                        'oppose',
                        'request-for-signature',
                        'request-for-veto',
                    ],
                }),
                validate({ field: 'talking_points' }),
                validate({
                    field: 'talking_points.*',
                    isRequired: true,
                    min: 2,
                    max: null,
                }),
                validate({ field: 'instructions', isRequired: false }),
                validate({ field: 'send_to' }),
                validate({ field: 'writing_style', isRequired: false }),
                validate({ field: 'writing_style.length', isRequired: false }),
                validate({
                    field: 'writing_style.template',
                    isRequired: false,
                }),
                validate({ field: 'writing_style.tone', isRequired: false }),
                validate({ field: 'writing_style.style', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(create),
        },

        get: {
            middlewares: [
                authenticate,
                validate({ field: 'client_ids', isRequired: false, min: 1 }),
                validate({ field: 'bill_id', isRequired: false }),
                validate({ field: 'stance', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(get),
        },
    },
    '/:id': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(view),
        },
        put: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'bill_id', isRequired: false, min: 1 }),
                validate({ field: 'clients', isRequired: false }),
                validate({ field: 'stance', isRequired: false }),
                validate({ field: 'talking_points', isRequired: false }),
                validate({
                    field: 'talking_points.*',
                    isRequired: false,
                    min: 2,
                    max: null,
                }),
                validate({ field: 'instructions', isRequired: false }),
                validate({ field: 'send_to', isRequired: false }),
                validate({ field: 'writing_style', isRequired: false }),
                validate({ field: 'writing_style.length', isRequired: false }),
                validate({
                    field: 'writing_style.template',
                    isRequired: false,
                }),
                validate({ field: 'writing_style.tone', isRequired: false }),
                validate({ field: 'writing_style.style', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(create),
        },
        delete: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(remove),
        },
    },
    '/:id/update-content': {
        put: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'output', min: null, max: null }),
                validationResponse,
            ],
            action: asyncHandler(update),
        },
    },
}
