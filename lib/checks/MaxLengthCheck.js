'use strict';

const Check = require('./Check');
const CheckError = require('../errors/CheckError');

class MaxLengthCheck extends Check {
    constructor(n) {
        super();
        this.n = n;
    }
    check(value) {
        if (value.length > this.n) {
            throw new CheckError(value.length, this.n, 'MaxLengthCheck: actual length exceeds max length');
        }
    }
}

module.exports = MaxLengthCheck;
