
/*
    TCFramework
    Copyright (c) 2021 Thomas Cort <linuxgeek@gmail.com>

    Permission to use, copy, modify, and distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const {
    TestRunner,
    TestSuite,
    TestCase,
    ConsoleTestReporter,
    expect,
    LengthCheck,
    MaxLengthCheck,
    MinLengthCheck,
    TypeCheck,
    PatternCheck,
} = require('./tcframework');

////////////////////////////////////////////
//
// all the tests!
//
////////////////////////////////////////////

new TestRunner([

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
            ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).toThrow('LengthCheckError'));
        }),

    ]),

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
            ].forEach((testcase) => expect(() => new MaxLengthCheck(testcase.length).check(testcase.value)).toThrow('MaxLengthCheckError'));
        }),

    ]),

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
            ].forEach((testcase) => expect(() => new MinLengthCheck(testcase.length).check(testcase.value)).toThrow('MinLengthCheckError'));
        }),

    ]),

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
            ].forEach((testcase) => expect(() => new TypeCheck(testcase.type).check(testcase.value)).toThrow('TypeCheckError'));
        }),

    ]),

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
            ].forEach((testcase) => expect(() => new PatternCheck(testcase.pattern).check(testcase.value)).toThrow('PatternCheckError'));
        }),

    ]),

]).execute(new ConsoleTestReporter());
