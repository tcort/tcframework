'use strict';

const ExpectationError = require('../errors/ExpectationError');

class Expectation {
    constructor(actual) {
        this.actual = actual;
    }

    notToThrow(message = 'expected not to throw error') {
        try {
            this.actual();
        } catch (err) {
            throw new ExpectationError(err, undefined, message);
        }
    }

    toThrow(errorName = 'Error', message = 'expected to throw error') {
        try {
            this.actual();
            throw new TestError('should have thrown but did not');
        } catch (err) {
            if (err.name !== errorName) {
                throw new ExpectationError(err.name, errorName, message);
            }
        }
    }

    equals(expected, message = 'actual !== expected') {
        if (this.actual !== expected) {
            throw new ExpectationError(this.actual, expected, message);
        }
    }
}

function expect(value) {
    return new Expectation(value);
}

module.exports = expect;
