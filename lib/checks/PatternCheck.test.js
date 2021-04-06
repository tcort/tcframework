'use strict';

const PatternCheck = require('./PatternCheck');
const { expect, TestCase, TestSuite } = require('../testing');

new TestSuite('PatternCheck', [

    new TestCase('checks that expected pattern matches input', () => {
        [
            { pattern: /apple/, value: 'crabapple' },
            { pattern: /^[0-9]+$/, value: '1234567' },
        ].forEach((testcase) => expect(() => new PatternCheck(testcase.pattern).check(testcase.value)).notToThrow());
    }),
    new TestCase('throws error when expected pattern does not match input', () => {
        [
            { pattern: /apple/, value: 'pear' },
            { pattern: /^[a-z]+$/, value: 'apple sauce' },
        ].forEach((testcase) => expect(() => new PatternCheck(testcase.pattern).check(testcase.value)).toThrow('CheckError'));
    }),

]).execute();
