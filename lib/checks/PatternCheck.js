'use strict';

const Check = require('./Check');
const CheckError = require('../errors/CheckError');

class PatternCheck extends Check {
    constructor(pattern) {
        super();
        this.pattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    }
    check(value) {
        if (!this.pattern.test(value)) {
            throw new CheckError(value, this.pattern.toString(), 'PatternCheck: actual value does not match pattern');
        }
    }
}

module.exports = PatternCheck;
