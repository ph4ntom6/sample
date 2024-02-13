import { get } from './get.action'
import { view } from './view.action'
import { me } from './me.action'
import { create } from './create.action'
import { update } from './update.action'
import { changePassword } from './change-password.action'

import authenticate from '../../middlewares/authenticate'
import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'
import { validate } from '../../validators/user'
import checkScopes from '../../middlewares/check-scopes'

module.exports = {
    '/': {
        post: {
            middlewares: [
                authenticate,
                checkScopes('admin-access'),
                validate({ field: 'full_name', isRequired: true }),
                validate({ field: 'email', isRequired: true }),
                validate({ field: 'role_id', isRequired: true }),
                validate({ field: 'business_id', isRequired: true }),
                validationResponse,
            ],
            action: asyncHandler(create),
        },
        get: {
            middlewares: [authenticate, checkScopes('admin-access')],
            action: asyncHandler(get),
        },
    },
    '/me': {
        get: {
            middlewares: [authenticate],
            action: asyncHandler(me),
        },
        put: {
            middlewares: [
                authenticate,
                validate({ field: 'full_name', isRequired: false }),
                validate({ field: 'email', isRequired: false }),
                validate({
                    field: 'status',
                    values: ['active', 'blocked'],
                    isRequired: false,
                }),
                validationResponse,
            ],
            action: asyncHandler(update),
        },
    },
    '/me/password': {
        put: {
            middlewares: [
                authenticate,
                validate({ field: 'oldPassword' }),
                validate({ field: 'newPassword' }),
                validate({ field: 'confirmPassword' }),
                validationResponse,
            ],
            action: asyncHandler(changePassword),
        },
    },
    '/:id': {
        get: {
            middlewares: [
                authenticate,
                checkScopes('admin-access'),
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(view),
        },
        put: {
            middlewares: [
                authenticate,
                checkScopes('admin-access'),
                validate({ field: 'full_name', isRequired: false }),
                validate({ field: 'email', isRequired: false }),
                validate({
                    field: 'status',
                    values: ['active', 'blocked'],
                    isRequired: false,
                }),
                validationResponse,
            ],
            action: asyncHandler(update),
        },
    },
}
