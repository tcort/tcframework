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
            { template: 'Hello, [=/name]!', locals: { name: 'Bob' }, output: 'Hello, Bob!' },
            { template: '[=/exp]', locals: { exp: '2 < 4' }, output: '2 &#60; 4' },
        ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
    }),

    new TestCase('inserts variable values (unescaped)', () => {
        [
            { template: 'Hello, [-/name]!', locals: { name: 'Bob' }, output: 'Hello, Bob!' },
            { template: '[-/exp]', locals: { exp: '2 < 4' }, output: '2 < 4' },
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
