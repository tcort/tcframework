'use strict';

class CheckError extends Error {

    constructor(actual, expected, message) {
        super(message);
        this.name = 'CheckError';
        this.actual = actual;
        this.expected = expected;
    }

}

module.exports = CheckError;
