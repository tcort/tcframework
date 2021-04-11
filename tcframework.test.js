
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
    JSONPointer,
    TCTemplate,
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

    new TestSuite('JSONPointer', [

        new TestCase('JSONPointer.get() gives the same results as the RFC', () => {

            const doc = {
                "foo": ["bar", "baz"],
                "": 0,
                "a/b": 1,
                "c%d": 2,
                "e^f": 3,
                "g|h": 4,
                "i\\j": 5,
                "k\"l": 6,
                " ": 7,
                "m~n": 8,
            };

            [
                { ptr: '', expected: doc },
                { ptr: '/foo', expected: doc.foo },
                { ptr: '/foo/0', expected: doc.foo[0] },
                { ptr: '/', expected: 0 },
                { ptr: '/a~1b', expected: 1 },
                { ptr: '/c%d', expected: 2 },
                { ptr: '/e^f', expected: 3 },
                { ptr: '/g|h', expected: 4 },
                { ptr: '/i\\j', expected: 5 },
                { ptr: '/k"l', expected: 6 },
                { ptr: '/ ', expected: 7 },
                { ptr: '/m~0n', expected: 8 },
            ].forEach((testcase) => expect(JSONPointer.get(doc, testcase.ptr)).equals(testcase.expected));
        }),

        new TestCase('JSONPointer.get() regression tests', () => {

            [
                { ptr: '/todo/done', doc: { todo: { task: 'x', done: false } }, expected: false },
            ].forEach((testcase) => expect(JSONPointer.get(testcase.doc, testcase.ptr)).equals(testcase.expected));

        }),

        new TestCase('JSONPointer.set() can set values', () => {

            const doc = { };

            JSONPointer.set(doc, '/foo', ['bar','bar']);
            JSONPointer.set(doc, '/foo/0', 'foo');
            JSONPointer.set(doc, '/foo/2', 'baz');
            JSONPointer.set(doc, '/path/to/freedom', 35);

            expect(doc.foo[0]).equals('foo');
            expect(doc.foo[1]).equals('bar');
            expect(doc.foo[2]).equals('baz');
            expect(doc.path.to.freedom).equals(35);

        }),

    ]),

    new TestSuite('TCTemplate', [

        new TestCase('renders a plain text template with the provided variables', () => {
            [
                { template: 'Hello, World!', locals: {}, output: 'Hello, World!' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('renders an HTML template with the provided variables without altering the HTML', () => {
            [
                { template: 'Hello, <em>Alice</em>!', locals: {}, output: 'Hello, <em>Alice</em>!' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('inserts variable values (escaped)', () => {
            [
                { template: '<span class="todo-[=/todo/done]">[=/todo/task]</span>', locals: { todo: { task: 'x', done: false } }, output: '<span class="todo-false">x</span>' },
                { template: 'Hello, [=/name]!', locals: { name: 'Bob' }, output: 'Hello, Bob!' },
                { template: '2 + 2 ? [=/x]!', locals: { x: true }, output: '2 + 2 ? true!' },
                { template: '[=/exp]', locals: { exp: '2 < 4' }, output: '2 &#60; 4' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('inserts variable values (unescaped)', () => {
            [
                { template: 'Hello, [-/name]!', locals: { name: 'Bob' }, output: 'Hello, Bob!' },
                { template: '[-/exp]', locals: { exp: '2 < 4' }, output: '2 < 4' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('interprets iteration', () => {
            [
                {
                    template: '[for /day in /daysofweek][=/day][if /exclaim]![/if] [/for]',
                    locals: {
                        exclaim: true,
                        daysofweek: [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                        ]
                    }, output: 'Sunday! Monday! Tuesday! Wednesday! Thursday! Friday! Saturday! ' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('interprets conditionals', () => {
            [
                { template: '[if /morning]Good Morning[/if]', locals: { morning: true }, output: 'Good Morning' },
                { template: '[if /morning]Good Morning[/if]', locals: { morning: false }, output: '' },
                { template: '[if /morning][if /good]Good [/if]Morning[/if]', locals: { morning: true, good: false }, output: 'Morning' },
                { template: '[if /foo]1[if /bar]2[if /baz]3[/if]4[/if]5[/if]', locals: { foo: true, bar: false, baz: true }, output: '15' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('does not output contents of [comment]...[/comment] blocks', () => {
            [
                { template: '[comment]this is a test[/comment]', locals: {}, output: '' },
                { template: 'Hello, [comment]this is a test[/comment]World!', locals: {}, output: 'Hello, World!' },
                { template: '[comment]this is a test[/comment]Hello, World!', locals: {}, output: 'Hello, World!' },
                { template: 'Hello, World![comment]this is a test[/comment]', locals: {}, output: 'Hello, World!' },
                { template: 'Hello, World![comment]this is a [comment]comment within a comment[/comment]!?!?![/comment]', locals: {}, output: 'Hello, World!' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),
    ]),

]).execute(new ConsoleTestReporter());
