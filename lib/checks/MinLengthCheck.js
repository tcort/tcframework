'use strict';

const Check = require('./Check');
const CheckError = require('../errors/CheckError');

class MinLengthCheck extends Check {
    constructor(n) {
        super();
        this.n = n;
    }
    check(value) {
        if (value.length < this.n) {
            throw new CheckError(value.length, this.n, 'MinLengthCheck: actual length is less than min length')
        }
    }
}

module.exports = MinLengthCheck;
