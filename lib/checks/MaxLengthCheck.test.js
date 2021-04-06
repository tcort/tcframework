'use strict';

const MaxLengthCheck = require('./MaxLengthCheck');
const { expect, TestCase, TestSuite } = require('../testing');

new TestSuite('MaxLengthCheck', [

    new TestCase('checks that max length is greater than or equal to input length', () => {
        [
            { length: 0, value: '' },
            { length: 0, value: [] },
            { length: 1, value: 'x' },
            { length: 1, value: ['x'] },
            { length: 2, value: 'x' },
            { length: 3, value: [1,2] },
            { length: 3, value: 'foo' },
            { length: 3, value: [1,2,3] },
        ].forEach((testcase) => expect(() => new MaxLengthCheck(testcase.length).check(testcase.value)).notToThrow());
    }),
    new TestCase('throws error when max length is not greater than or equal to input length', () => {
        [
            { length: 0, value: 'apple' },
            { length: 1, value: 'apple' },
            { length: 1, value: 'fo' },
            { length: 3, value: 'apple' },
        ].forEach((testcase) => expect(() => new MaxLengthCheck(testcase.length).check(testcase.value)).toThrow('CheckError'));
    }),

]).execute();
