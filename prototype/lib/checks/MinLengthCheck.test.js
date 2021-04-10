'use strict';

const MinLengthCheck = require('./MinLengthCheck');
const { expect, TestCase, TestSuite } = require('../testing');

new TestSuite('MinLengthCheck', [

    new TestCase('checks that min length is less than or equal to input length', () => {
        [
            { length: 0, value: '' },
            { length: 0, value: [] },
            { length: 1, value: 'x' },
            { length: 1, value: ['x'] },
            { length: 2, value: 'xxx' },
            { length: 3, value: [1,2,3,4,5] },
            { length: 3, value: 'foo' },
            { length: 3, value: [1,2,3] },
        ].forEach((testcase) => expect(() => new MinLengthCheck(testcase.length).check(testcase.value)).notToThrow());
    }),
    new TestCase('throws error when min length is not less than or equal to input length', () => {
        [
            { length: 1, value: '' },
            { length: 2, value: 'x' },
            { length: 3, value: '42' },
        ].forEach((testcase) => expect(() => new MinLengthCheck(testcase.length).check(testcase.value)).toThrow('CheckError'));
    }),

]).execute();
