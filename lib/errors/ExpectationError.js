'use strict';

class ExpectationError extends Error {

    constructor(actual, expected, message) {
        super(message);
        this.name = 'ExpectationError';
        this.actual = actual;
        this.expected = expected;
    }

}

module.exports = ExpectationError;
