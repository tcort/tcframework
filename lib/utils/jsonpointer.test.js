'use strict';

const jsonpointer = require('./jsonpointer');
const { expect, TestCase, TestSuite } = require('../testing');

new TestSuite('jsonpointer', [

    new TestCase('gives the same results as the RFC', () => {

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
        ].forEach((testcase) => expect(jsonpointer(doc, testcase.ptr)).equals(testcase.expected));
    }),

]).execute();
