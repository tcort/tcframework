'use strict';

const { ObjectCheck } = require('../checks');
const ValidatorBase = require('./ValidatorBase');

class ObjectValidator extends ValidatorBase {
    constructor(obj = {}) {
        super();
        this.checks.push(new ObjectCheck(obj));
    }
}

module.exports = ObjectValidator;
