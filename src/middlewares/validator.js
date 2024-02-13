import dayjs from 'dayjs'
import { check } from 'express-validator'
import { startCase } from 'lodash'
/** helpers functions **/
import translate from '../helpers/translate'

export const validate = (field, model) => {
    switch (field) {
        case 'startDate': {
            return check(field).custom(async (value, { req }) => {
                const now = dayjs()
                const startDate = value
                    ? dayjs(value, 'YYYY-MM-DD HH:mm:ssZ')
                    : null

                const endDate = req.query.endDate
                    ? dayjs(req.query.endDate, 'YYYY-MM-DD HH:mm:ssZ')
                    : null

                if (startDate && !startDate.isValid()) {
                    throw new Error(
                        translate('validations', 'invalidDate', {
                            ':attribute': startCase(field),
                        })
                    )
                }

                if (startDate && !startDate.isSameOrBefore(now)) {
                    throw new Error(
                        translate('validations', 'dateAfterNow', {
                            ':attribute': startCase(field),
                            ':date': 'Start Date',
                        })
                    )
                }

                if (
                    startDate &&
                    endDate &&
                    !startDate.isSameOrBefore(endDate)
                ) {
                    throw new Error(
                        translate('validations', 'dateBeforeEndDate', {
                            ':attribute': startCase(field),
                            ':date': 'End Date',
                        })
                    )
                }

                return value
            })
        }

        case 'endDate': {
            return check(field).custom(async (value, { req }) => {
                const startDate = req.query.startDate
                    ? dayjs(req.query.startDate, 'YYYY-MM-DD HH:mm:ssZ')
                    : null

                const endDate = value
                    ? dayjs(value, 'YYYY-MM-DD HH:mm:ssZ')
                    : null

                if (endDate && !endDate.isValid()) {
                    throw new Error(
                        translate('validations', 'invalidDate', {
                            ':attribute': startCase(field),
                        })
                    )
                }

                if (endDate && startDate && !endDate.isSameOrAfter(startDate)) {
                    throw new Error(
                        translate('validations', 'dateAfterStartDate', {
                            ':attribute': startCase(field),
                            ':date': 'Start Date',
                        })
                    )
                }

                return value
            })
        }

        case 'email': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isEmail()
                .withMessage(
                    translate('validations', 'valid', {
                        ':attribute': field,
                    })
                )
        }

        case 'password': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isLength({ min: 8, max: 50 })
                .withMessage(
                    translate('validations', 'length', {
                        ':attribute': 'Password',
                        ':min': '8',
                        ':max': '50',
                    })
                )
        }
        case 'confirmPassword': {
            return check(field).custom((confirmPassword, { req }) => {
                if (!confirmPassword) {
                    throw new Error(
                        translate('validations', 'required', {
                            ':attribute': startCase(field),
                        })
                    )
                } else if (req.body.password !== confirmPassword) {
                    throw new Error(
                        translate('validations', 'password.mismatch')
                    )
                }
                return confirmPassword
            })
        }

        case 'role_title': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isIn(['Platform Owner', 'Admin', 'Associate'])
                .withMessage(translate('validations', 'roleTitles'))
        }

        case 'order': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isInt()
                .withMessage(
                    translate('validations', 'integer', {
                        ':attribute': startCase(field),
                    })
                )
                .not()
                .isString()
                .withMessage(
                    translate('validations', 'valid', {
                        ':attribute': startCase(field),
                    })
                )
        }
        case 'isRequired': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .not()
                .isString()
                .withMessage(
                    translate('validations', 'valid', {
                        ':attribute': startCase(field),
                    })
                )
                .isBoolean()
                .withMessage(
                    translate('validations', 'boolean', {
                        ':attribute': startCase(field),
                    })
                )
        }
        case 'status': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isIn(model)
                .withMessage(
                    translate('validations', 'invalidEnum', {
                        ':attribute': 'status',
                        ':values': model.toString(),
                    })
                )
        }
    }
}

export const validateType = (params) => {
    const { field, type, min, max } = params

    switch (type) {
        case 'boolean': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isBoolean()
                .withMessage(
                    translate('validations', 'boolean', {
                        ':attribute': startCase(field),
                    })
                )
        }
        case 'string': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isString()
                .withMessage(
                    translate('validations', 'valid', {
                        ':attribute': startCase(field),
                    })
                )
                .isLength({ min: min, max: max })
                .withMessage(
                    translate('validations', 'length', {
                        ':attribute': startCase(field),
                        ':min': min,
                        ':max': max,
                    })
                )
        }

        case 'date': {
            return check(field).custom(async (value, { req }) => {
                const now = dayjs()
                if (
                    dayjs(value, 'DD/MM/YYYY', true).isValid() &&
                    dayjs(value, 'DD/MM/YYYY', true).isBefore(now)
                ) {
                    return value
                }
                throw new Error(
                    translate('validations', 'dateAfterNow', {
                        ':attribute': startCase(field),
                    })
                )
            })
        }
        case 'number': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': startCase(field),
                    })
                )
                .isNumeric()
                .withMessage(
                    translate('validations', 'numeric', {
                        ':attribute': startCase(field),
                    })
                )
                .isInt({ min: 1 })
                .withMessage(
                    translate('validations', 'greaterThan', {
                        ':attribute': startCase(field),
                        ':value': '1',
                    })
                )
        }
    }
}
