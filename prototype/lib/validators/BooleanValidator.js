'use strict';

const {
    TypeCheck,
} = require('../checks');
const ValidatorBase = require('./ValidatorBase');

class BooleanValidator extends ValidatorBase {
    constructor() {
        super();
        this.checks.push(new TypeCheck('boolean'));
    }
}

module.exports = BooleanValidator;
