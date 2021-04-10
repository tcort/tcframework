'use strict';

const Check = require('./Check');
const CheckError = require('../errors/CheckError');

class LengthCheck extends Check {
    constructor(n) {
        super();
        this.n = n;
    }
    check(value) {
        if (value.length !== this.n) {
            throw new CheckError(value.length, this.n, 'LengthCheck: actual length does not equal expected length');
        }
    }
}

module.exports = LengthCheck;
