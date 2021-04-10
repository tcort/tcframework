'use strict';

const ValidationError = require('../errors/ValidationError');

class ValidatorBase {

    constructor() {
        this.checks = [];
    }

    validate(value) {
        const checkErrors = [];

        this.checks.forEach((checker) => {
            try {
                checker.check(value);
            } catch (checkError) {
                checkErrors.push(checkError);
            }
        });

        if (checkErrors.length !== 0) {
            throw new ValidationError(checkErrors, 'ValidatorBase: one or more validation checks failed');
        }
    }

}

module.exports = ValidatorBase;
