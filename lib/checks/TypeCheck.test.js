'use strict';

const TypeCheck = require('./TypeCheck');
const { expect, TestCase, TestSuite } = require('../testing');

new TestSuite('TypeCheck', [

    new TestCase('checks that expected type matches type of input', () => {
        [
            { type: 'string', value: '' },
            { type: 'string', value: 'hello' },
            { type: 'object', value: {} },
            { type: 'object', value: { foo: 1, bar: 2 } },
            { type: 'object', value: null },
            { type: 'object', value: new Date() },
            { type: 'object', value: /foobar/g },
            { type: 'number', value: 4 },
            { type: 'number', value: 0 },
            { type: 'number', value: -40 },
            { type: 'undefined', value: undefined },
        ].forEach((testcase) => expect(() => new TypeCheck(testcase.type).check(testcase.value)).notToThrow());
    }),
    new TestCase('throws error when expected type does not match type of input', () => {
        [
            { type: 'string', value: 4 },
            { type: 'string', value: null },
            { type: 'number', value: '' },
            { type: 'object', value: '' },
            { type: 'object', value: -52 },
            { type: 'undefined', value: /xy/g },
            { type: 'number', value: new Date() },
        ].forEach((testcase) => expect(() => new TypeCheck(testcase.type).check(testcase.value)).toThrow('CheckError'));
    }),

]).execute();
