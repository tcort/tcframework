'use strict';

const TCTemplate = require('./TCTemplate');
const { expect, TestCase, TestSuite } = require('../testing');

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
]).execute();