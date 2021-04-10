'use strict';

const LengthCheck = require('./LengthCheck');
const { expect, TestCase, TestSuite } = require('../testing');

new TestSuite('LengthCheck', [

    new TestCase('checks that expected length matches input', () => {
        [
            { length: 0, value: '' },
            { length: 0, value: [] },
            { length: 1, value: 'x' },
            { length: 1, value: ['x'] },
            { length: 3, value: 'foo' },
            { length: 3, value: [1,2,3] },
        ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).notToThrow());
    }),
    new TestCase('throws error when expected length does not match input', () => {
        [
            { length: 0, value: 'apple' },
            { length: 1, value: 'apple' },
            { length: 1, value: '' },
            { length: 3, value: 'apple' },
        ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).toThrow('CheckError'));
    }),

]).execute();
