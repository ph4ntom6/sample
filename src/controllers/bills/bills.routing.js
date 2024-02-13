import { get } from './get.action'
import { view } from './view.action'
import { count } from './count.action'
import { getVersions } from './versions.get.action'
import { getAnalysis } from './analysis.get.action'
import { getMessages } from './messages.get.action'
import { viewMessage } from './messages.view.action'
import { getBillTimeline } from './timeline.get.action'
import { createMessage } from './messages.create.action'
import { getVoteSession } from './vote-session.get.action'
import { viewLawAmended } from './law-amended.view.action'
import { addUserBillTrack } from './user-bill-track.action'
import { viewVoteSummary } from './vote-summary.view.action'
import { viewConversation } from './conversations.view.action'
import { getImpactedClients } from './impacted-clients.get.action'
import { createConversation } from './conversations.create.action'
import { viewSummaryImpacts } from './summary-impacts.view.action'

import { validate } from '../../validators/bills'

import authenticate from '../../middlewares/authenticate'
import { asyncHandler } from '../../middlewares/exception-handler'
import validationResponse from '../../middlewares/validation-response'

module.exports = {
    '/': {
        get: {
            middlewares: [
                authenticate,
                validate({
                    field: 'keyword',
                    min: 0,
                    max: 500,
                    isRequired: false,
                }),
                validate({
                    field: 'measure_type',
                    isRequired: false,
                }),
                validate({ field: 'session', isRequired: false }),
                validate({ field: 'code', min: 0, isRequired: false }),
                validate({ field: 'chamber', min: 0, isRequired: false }),
                validate({ field: 'status', min: 0, isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(get),
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
                validate({ field: 'bill_version_id', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(view),
        },
    },
    '/:id/vote-session': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(getVoteSession),
        },
    },
    '/:id/user-bill-track': {
        post: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({
                    field: 'action',
                    values: ['follow', 'unfollow'],
                }),
                validationResponse,
            ],
            action: asyncHandler(addUserBillTrack),
        },
    },
    '/:id/timeline': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(getBillTimeline),
        },
    },
    '/:id/versions': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(getVersions),
        },
    },

    '/:id/todays-law-amended': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(viewLawAmended),
        },
    },

    '/:id/analysis': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validationResponse,
            ],
            action: asyncHandler(getAnalysis),
        },
    },
    '/:id/vote-summary': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'vote_date_time' }),
                validate({ field: 'location_code' }),
                validate({ field: 'motion_id' }),
                validate({ field: 'vote_date_seq' }),
                validationResponse,
            ],
            action: asyncHandler(viewVoteSummary),
        },
    },
    '/:id/impacted-clients': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'bill_version_id', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(getImpactedClients),
        },
    },

    '/:id/summary-and-impacts': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                // validate({ field: 'bill_version_id' }),
                validationResponse,
            ],
            action: asyncHandler(viewSummaryImpacts),
        },
    },

    '/:id/conversations': {
        post: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'bill_version_id', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(createConversation),
        },
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'bill_version_id', isRequired: false }),
                validationResponse,
            ],
            action: asyncHandler(viewConversation),
        },
    },

    '/:id/messages': {
        post: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'bill_version_id', isRequired: false }),
                validate({ field: 'conversation_id', isRequired: false }),
                validate({ field: 'message', min: 2, max: 500 }),
                validationResponse,
            ],
            action: asyncHandler(createMessage),
        },
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'conversation_id' }),
                validationResponse,
            ],
            action: asyncHandler(getMessages),
        },
    },

    '/:id/messages/:messageId': {
        get: {
            middlewares: [
                authenticate,
                validate({ field: 'id' }),
                validate({ field: 'messageId' }),
                validationResponse,
            ],
            action: asyncHandler(viewMessage),
        },
    },
}
