'use strict';

const TestError = require('../errors/TestError');

class TestCase {

    constructor(expectation = '', fn = () => false) {
        this.expectation = expectation;
        this.fn = fn;
    }

    execute() {
        try {
            this.fn();
            console.log(`\tPASS\t${this.expectation}`);
        } catch (err) {
            console.error(`\tFAIL\t${this.expectation}`, err);
            throw new TestError('Test failure');
        }
    }

}

module.exports = TestCase;
