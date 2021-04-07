'use strict';

const JSONPointer = require('./JSONPointer');
const { expect, TestCase, TestSuite } = require('../testing');

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

]).execute();
