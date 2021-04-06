'use strict';

const BooleanValidator = require('./BooleanValidator');
const ObjectValidator = require('./ObjectValidator');
const StringValidator = require('./StringValidator');

class Validator {

    static boolean() {
        return new BooleanValidator();
    }

    static string() {
        return new StringValidator();
    }

    static object(obj = {}) {
        return new ObjectValidator(obj);
    }

}

module.exports = Validator;
