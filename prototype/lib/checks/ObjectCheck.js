'use strict';

const Check = require('./Check');

class ObjectCheck extends Check {
    constructor(obj) {
        super();
        this.obj = obj;
    }
    check(value) {
        Object.keys(this.obj).forEach((key) => this.obj[key].validate(value[key]));
    }
}

module.exports = ObjectCheck;
