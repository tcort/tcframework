'use strict';

class ValidationError extends Error {

    constructor(checkErrors, message) {
        super(message);
        this.name = 'ValidationError';
        this.checkErrors = checkErrors;
    }

}

module.exports = ValidationError;
