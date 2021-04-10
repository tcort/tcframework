'use strict';

const Check = require('./Check');
const CheckError = require('../errors/CheckError');

class TypeCheck extends Check {
    constructor(type = 'undefined') {
        super();
        this.type = type;
    }
    check(value) {
        if (typeof value !== this.type) {
            throw new CheckError(typeof value, this.type, 'TypeCheck: value does not have expected type');
        }
    }
}

module.exports = TypeCheck;
