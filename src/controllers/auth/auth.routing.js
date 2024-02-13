import { login } from './login.action'
import { logout } from './logout.action'
import { refresh } from './refresh.action'

import { check } from 'express-validator'

/* middlewares */
import { validate } from '../../validators/auth'

/** helpers functions **/
import translate from '../../helpers/translate'

import authenticate from '../../middlewares/authenticate'
import validationResponse from '../../middlewares/validation-response'
import { asyncHandler } from '../../middlewares/exception-handler'

module.exports = {
    '/login': {
        post: {
            middlewares: [
                validate('email'),
                check('password')
                    .not()
                    .isEmpty()
                    .withMessage(
                        translate('validations', 'required', {
                            ':attribute': 'Password',
                        })
                    ),
                validate('remember'),
                validationResponse,
            ],
            action: login,
        },
    },
    '/logout': {
        post: {
            middlewares: [authenticate],
            action: logout,
        },
    },
    '/refresh': {
        post: {
            action: asyncHandler(refresh),
        },
    },
}
