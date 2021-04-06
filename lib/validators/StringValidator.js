'use strict';

const {
    LengthCheck,
    MaxLengthCheck,
    MinLengthCheck,
    PatternCheck,
    TypeCheck,
} = require('../checks');
const ValidatorBase = require('./ValidatorBase');

class StringValidator extends ValidatorBase {
    constructor() {
        super();
        this.checks.push(new TypeCheck('string'));
    }

    length(n) {
        this.checks.push(new LengthCheck(n));
        return this;
    }

    min(n) {
        this.checks.push(new MinLengthCheck(n));
        return this;
    }

    max(n) {
        this.checks.push(new MaxLengthCheck(n));
        return this;
    }

    pattern(pattern) {
        this.checks.push(new PatternCheck(pattern));
        return this;
    }
}

module.exports = StringValidator;
