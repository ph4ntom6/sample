import { check } from 'express-validator'

/** helpers functions **/
import translate from '../helpers/translate'
import sentenceCase from '../helpers/sentence-case'

export const validate = (field) => {
    switch (field) {
        case 'email': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': sentenceCase(field),
                    })
                )
                .isEmail()
                .withMessage(
                    translate('validations', 'valid', {
                        ':attribute': sentenceCase(field),
                    })
                )
        }

        case 'password': {
            return check(field)
                .not()
                .isEmpty()
                .withMessage(
                    translate('validations', 'required', {
                        ':attribute': sentenceCase(field),
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
                .matches(/^.*[0-9].*$/)
                .withMessage(
                    translate('validations', 'password.characters', {
                        ':attribute': 'Password',
                    })
                )
        }

        case 'remember': {
            return check(field)
                .optional({ checkFalsy: true })
                .isBoolean()
                .withMessage(
                    translate('validations', 'boolean', {
                        ':attribute': sentenceCase(field),
                    })
                )
        }
    }
}
