
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
            ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).toThrow('TCCheckError'));
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
            ].forEach((testcase) => expect(() => new MaxLengthCheck(testcase.length).check(testcase.value)).toThrow('TCCheckError'));
        }),

    ]),

]).execute(new ConsoleTestReporter());
