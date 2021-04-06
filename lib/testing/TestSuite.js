'use strict';

class TestSuite {

    constructor(name = '', tests = []) {
        this.name = name;
        this.tests = tests;
    }

    execute() {
        console.log(`${this.name} Test Suite`);
        this.tests.forEach((test) => test.execute());
        console.log('');
    }
}

module.exports = TestSuite;
