import { get } from './get.action'
import { view } from './view.action'
import { update } from './update.action'
import { create } from './create.action'
import { remove } from './remove.action'
import { count } from './count.action'
import { getPosition } from './position.get.action'
import { updatePosition } from './position.update.action'
import { viewScorecard } from './scorecard.view.action'
import { updateScorecard } from './scorecard.update.action'
import { createScorecard } from './scorecard.create.action'
import { getClientBills } from './client-bills.get.action'
import { createClientImpacts } from './impacts.create.action'
import { viewClientImpact } from './impacts.view.action'

import { validate } from '../../validators/client'

/** Middleware functions */
import authenticate from '../../middlewares/authenticate'
import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'

module.exports = {
    '/': {
        get: {
            middlewares: [
                authenticate,
                validate({
                    field: 'status',
                    values: ['active', 'in-active'],
                    isRequired: false,
                }),
                validate({
                    field: 'keyword',
                    isRequired: false,
                }),
                validationResponse,
            ],
            action: asyncHandler(get),
        },
        post: {
            middlewares: [
                authenticate,
                validate({
                    field: 'client_name',
                    min: 1,
                }),
                validate({
                    field: 'industry_id',
                }),
                validate({
                    field: 'short_bio',
                    max: 500,
                }),
                validate({
                    field: 'cp_name',
                    min: 1,
                }),
                validate({
                    field: 'cp_email',
                }),
                validate({
                    field: 'cp_phone',
                }),
                validate({
                    field: 'cp_address',
                }),
                validationResponse,
            ],
            action: asyncHandler(create),
        },
    },
    '/count': {
        get: {
            middlewares: [authenticate],
            action: asyncHandler(count),
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
                validate({
                    field: 'id',
                }),
                validate({
                    field: 'client_name',
                    min: 1,
                    isRequired: false,
                }),
                validate({
                    field: 'industry_id',
                    isRequired: false,
                }),
                validate({
                    field: 'short_bio',
                    max: 500,
                    isRequired: false,
                }),
                validate({
                    field: 'cp_name',
                    min: 1,
                    isRequired: false,
                }),
                validate({
                    field: 'cp_email',
                    isRequired: false,
                }),
                validate({
                    field: 'cp_phone',
                    isRequired: false,
                }),
                validate({
                    field: 'cp_address',
                    isRequired: false,
                }),
                validate({
                    field: 'interests_goals',
                    isRequired: false,
                    min: 0,
                }),
                validate({
                    field: 'interests_goals.*',
                    min: 2,
                    max: 200,
                }),
                validate({
                    field: 'tracking_keywords',
                    isRequired: false,
                    min: 0,
                }),
                validate({
                    field: 'tracking_bills',
                    isRequired: false,
                    min: 0,
                }),
                validate({
                    field: 'tracking_keywords.*',
                }),
                validate({
                    field: 'tracking_bills.*',
                }),
                validationResponse,
            ],
            action: asyncHandler(update),
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
    '/impacts': {
        post: {
            middlewares: [
                authenticate,
                validate({
                    field: 'client_id',
                }),
                validate({
                    field: 'bill_id',
                    min: 1,
                }),
                validationResponse,
            ],
            action: asyncHandler(createClientImpacts),
        },
    },
    '/:id/impacts': {
        get: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),
                validate({
                    field: 'bill_id',
                    min: 1,
                }),
                validationResponse,
            ],
            action: asyncHandler(viewClientImpact),
        },
    },
    '/:id/add-position': {
        put: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),
                validate({
                    field: 'bill_id',
                }),
                validate({
                    field: 'stance',
                    values: ['support', 'neutral', 'oppose'],
                }),
                validate({
                    field: 'reasons',
                    min: 1,
                }),
                validate({
                    field: 'reasons.*',
                    max: 200,
                }),
                validationResponse,
            ],
            action: asyncHandler(updatePosition),
        },
    },
    '/:id/bill-tracking': {
        get: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),
                validationResponse,
            ],
            action: asyncHandler(getClientBills),
        },
    },
    '/:id/positions': {
        get: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),
                validationResponse,
            ],
            action: asyncHandler(getPosition),
        },
    },

    '/:id/scorecard': {
        get: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),
                validationResponse,
            ],
            action: asyncHandler(viewScorecard),
        },
        post: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),

                validationResponse,
            ],
            action: asyncHandler(createScorecard),
        },
        put: {
            middlewares: [
                authenticate,
                validate({
                    field: 'id',
                }),
                validate({ field: 'value', max: null }),
                validationResponse,
            ],
            action: asyncHandler(updateScorecard),
        },
    },
}
