
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

/**
 * @file TC Framework Core
 * @copyright Copyright (c) 2021 Thomas Cort <linuxgeek@gmail.com>
 * @license ISC
 */

'use strict';

module.exports = {};

/**
 * TCError represents an Error coming from TCFramework.
 *
 * It can be used with (err instanceof TCError) or (err instanceof Error)
 * It provides a helpful constructor which accepts an error name, message,
 * and additional attributes.
 *
 * @version 1.0.0
 * @extends Error
 */
class TCError extends Error {


    /**
     * Creates a new instance of TCError
     *
     * @constructor
     * @param {string} name - a name others can use to programatically distinguish this error from others..
     * @param {string} message - a developer friendly message.
     * @param {object} baggage - other useful data that is assigned to the new error object.
     */
    constructor(name = 'TCError', message = 'an error occurred', baggage = {}) {
        super(message);
        this.name = name;
        Object.assign(this, baggage);
    }
}

module.exports.TCError = TCError;

/**
 * Expectation checks the value passed to the constructor meets the expectation
 * denoted by the method calls.
 *
 * @version 1.0.0
 */
class Expectation {

    /**
     * Creates a new instance of Expectation
     *
     * @constructor
     * @param {any} actual - the value being tested.
     */
    constructor(actual) {
        this.actual = actual;
    }

    /**
     * expect the value passed to the constructor is a function that does not throw when invoked.
     *
     * @param {string} message - error message when expectation is not met.
     * @throws {TCError} an error with name TCExpectedNotToThrowError, actual value, and error thrown.
     * @returns {TCExpectation}
     */
    notToThrow(message = 'expected not to throw error') {
        try {
            this.actual();
        } catch (err) {
            throw new TCError('TCExpectedNotToThrowError', message, { actual: this.actual, err });
        }
        return this;
    }

    /**
     * expect the value passed to the constructor is a function that does throw when invoked.
     *
     * @param {string} errName - name of the error that is expected to be thrown.
     * @param {string} message - error message when expectation is not met.
     * @throws {TCError} an error with name TCExpectedToThrowError if an error isn't thrown.
     * @throws {TCError} an error with name TCExpectedToThrowErrorNameMismatchError if the wrong error is thrown..
     * @returns {TCExpectation}
     */
    toThrow(errorName = 'Error', message = 'expected to throw error') {
        try {
            this.actual();
            throw new TCError('TCExpectedToThrowError', message, { actual: this.actual, errorName });
        } catch (err) {
            if (err.name !== errorName) {
                throw new TCError('TCExpectedToThrowErrorNameMismatchError', message, { actual: this.actual, errorName, err });
            }
        }
        return this;
    }

    /**
     * expect the value passed to the constructor to equal the type passed to this function.
     *
     * @param {string} expected - type we're expecting (e.g. string, number, object, etc)
     * @param {string} message - error message when expectation is not met.
     * @throws {TCError} an error with name TCExpectedToHaveTypeError if typeof actual !== expected.
     * @returns {TCExpectation}
     */
    toHaveType(expected, message = 'typeof actual !== expected') {
        if (typeof this.actual !== expected) {
            throw new TCError('TCExpectedToHaveTypeError', message, { actual: typeof this.actual, expected });
        }
        return this;
    }

    /**
     * expect the value passed to the constructor to have a .length equal to the length passed to this function.
     *
     * @param {number} expected - length we're expecting.
     * @param {string} message - error message when expectation is not met.
     * @throws {TCError} an error with name TCExpectedToHaveLengthError if actual.length !== expected.
     * @returns {TCExpectation}
     */
    toHaveLength(expected, message = 'actual.length !== expected') {
        if (this.actual.length !== expected) {
            throw new TCError('TCExpectedToHaveLengthError', message, { actual: this.actual.length, expected });
        }
        return this;
    }

    /**
     * expect the value passed to the constructor to match the string passed to this function.
     *
     * @param {RegExp} expected - regular expression to test the value against.
     * @param {string} message - error message when expectation is not met.
     * @throws {TCError} an error with name TCExpectedMatchesError if !expected.test(actual).
     * @returns {TCExpectation}
     */
    matches(expected, message = '!expected.test(actual)') {
        if (!expected.test(this.actual)) {
            throw new TCError('TCExpectedMatchesError', message, { actual: this.actual, expected: expected.toString() });
        }
        return this;
    }

    /**
     * expect the value passed to the constructor strictly equals the expected value passed to this function.
     *
     * @param {any} expected - value to compare against actual value.
     * @param {string} message - error message when expectation is not met.
     * @throws {TCError} an error with name TCExpectedEqualsError if actual !== expected.
     * @returns {TCExpectation}
     */
    equals(expected, message = 'actual !== expected') {
        if (this.actual !== expected) {
            throw new TCError('TCExpectedEqualsError', message, { actual: this.actual, expected });
        }
        return this;
    }
}

module.exports.Expectation = Expectation;

/**
 * Accepts a value and returns a new TCExpectation for that value
 * @function expect
 * @returns {TCExpectation}
 * @version 1.0.0
 */
function expect(value) {
    return new Expectation(value);
}

module.exports.expect = expect;

/**
 * TestStats hold statistics on tests executed by test suites
 *
 * @version 1.0.0
 */
class TestStats {

    /**
     * Creates a new instance of TestStats
     *
     * @constructor
     * @param {number} pass - number of tests passed.
     * @param {number} fail - number of tests failed.
     */
    constructor(pass = 0, fail = 0) {
        this.pass = pass;
        this.fail = fail;
    }

    /**
     * getter for the number of tests executed
     *
     * @returns {number} total tests executed (i.e. pass + fail)
     */
    get total() {
        return this.pass + this.fail;
    }
}

module.exports.TestStats = TestStats;

/**
 * TestSuite is a named collection of TestCases
 *
 * @version 1.0.0
 */
class TestSuite {

    /**
     * Creates a new instance of TestSuite
     *
     * @constructor
     * @param {string} name - a name for this collection of tests.
     * @param {TestCase[]} tests - an array of TestCase to be executed.
     */
    constructor(name = '', tests = []) {
        this.name = name;
        this.tests = tests;
    }

    /**
     * Executes all of the tests.
     * @return {boolean} true for pass, false for fail.
     */
    execute(reporter) {
        reporter.beginTestSuite(this);
        const stats = this.tests.reduce((result, test) => {
            const pass = test.execute(reporter);
            if (pass === true) {
                result.pass++;
            } else {
                result.fail++;
            }
            return result;
        }, new TestStats());
        reporter.endTestSuite(this, stats);
        return (stats.fail === 0);
    }
}

module.exports.TestSuite = TestSuite;

/**
 * TestCase is a function with a description that tests some aspect of a program.
 *
 * @version 1.0.0
 */
class TestCase {

    /**
     * Creates a new instance of TestCase.
     *
     * It is called with a function which should return true if the test passes
     * or false if the test fails.
     *
     * @constructor
     * @param {string} description - describes what's being tested.
     * @param {function} fn - a function to execute
     */
    constructor(description = '', fn = () => false) {
        this.description = description;
        this.fn = fn;
    }

    /**
     * Executes this test.
     *
     * @param {TestReporter} reporter - instance of TestReporter to report on the results of the test.
     * @return {boolean} true for pass, false for fail.
     */
    execute(reporter) {
        reporter.beginTestCase(this);
        try {
            this.fn();
            reporter.endTestCase(this);
            return true;
        } catch (err) {
            reporter.endTestCase(this, err);
            return false;
        }
    }
}

module.exports.TestCase = TestCase;

/**
 * TestReporter interface
 *
 * @version 1.0.0
 */
class TestReporter {

    /**
     * Creates a new instance of TestReporter
     *
     * @constructor
     */
    constructor() {}

    /**
     * Invoked when a test suite is about to be executed
     *
     * @param {TestSuite} suite - test suite that is beginning
     */
    beginTestSuite(suite) {}

    /**
     * Invoked when a test suite has just been executed
     *
     * @param {TestSuite} suite - test suite that ended
     * @param {TestStats} stats - an instance of TestStats containing pass/fail statistics
     */
    endTestSuite(suite, stats) {}

    /**
     * Invoked when a test case is about to be executed
     *
     * @param {TestCase} test - test that is beginning
     */
    beginTestCase(test) {}

    /**
     * Invoked when a test case has just been executed
     *
     * @param {TestCase} test - test that ended
     * @param {TCTestError} err - an instance of TCError when the test has failed
     */
    endTestCase(test, err = undefined) {}

}

module.exports.TestReporter = TestReporter;

/**
 * ConsoleTestReporter outputs test results to the console.
 *
 * @version 1.0.0
 * @extends TestReporter
 */
class ConsoleTestReporter extends TestReporter {

    /**
     * Creates a new instance of ConsoleTestReporter
     *
     * @constructor
     */
    constructor() {
        super();
    }
    /**
     * Invoked when a test suite is about to be executed
     *
     * @param {TestSuite} suite - test suite that is beginning
     */
    beginTestSuite(suite) {
        console.log(`${suite.name}\n`);
    }

    /**
     * Invoked when a test suite has just been executed
     *
     * @param {TestSuite} suite - test suite that ended
     * @param {TestStats} stats - an instance of TestStats containing pass/fail statistics
     */
    endTestSuite(suite, stats) {
        console.log(`\n\t${stats.pass} passed, ${stats.fail} failed, ${stats.total} executed\n`);
    }

    /**
     * Invoked when a test case has just been executed
     *
     * @param {TestCase} test - test that ended
     * @param {TCTestError} err - an instance of TCError when the test has failed
     */
    endTestCase(test, err = undefined) {
        if (err) {
            console.log(`\tFAIL ${test.description}`);
            console.error('=-=-=-=-=-=-=-=-=-=-=-=');
            console.error(err);
            console.error('=-=-=-=-=-=-=-=-=-=-=-=');
        } else {
            console.log(`\tPASS ${test.description}`);
        }
    }

}

module.exports.ConsoleTestReporter = ConsoleTestReporter;

/**
 * TestRunner runs a set of test suites
 *
 * @version 1.0.0
 */
class TestRunner {

    /**
     * Creates a new instance of TestRunner
     *
     * @constructor
     * @param {TestSuite[]} tests - an array of TestSuite to be executed.
     */
    constructor(testsuites = []) {
        this.testsuites = testsuites;
    }

    /**
     * Executes all of the test suites.
     */
    execute(reporter) {
        this.testsuites.forEach((testsuite) => testsuite.execute(reporter));
    }
}

module.exports.TestRunner = TestRunner;

/**
 * Check evaluates some condition and either throws a TCCheckError or doesn't
 *
 * @version 1.0.0
 */
class Check {

    /**
     * Creates a new instance of Check.
     *
     * @constructor
     */
    constructor() {}

    /**
     * Checks the value.
     *
     * @param {any} value - a value to test
     * @throws {TCError} a TCCheckError.
     */
    check(value) {}
}

/**
 * LengthCheck checks the length of a value with a .length property (e.g. an array or string)
 *
 * @version 1.0.0
 * @extends Check
 */
class LengthCheck extends Check {

    /**
     * Creates a new instance of LengthCheck.
     *
     * @constructor
     * @param {number} n - the desired length for this check.
     */
    constructor(n) {
        super();
        this.n = n;
    }

    /**
     * Checks that the length of the value is the same as the length passed to the constructor.
     *
     * @param {object} value - an object with a .length property (e.g. a string, an array, etc).
     * @throws {TCError} LengthCheckError
     */
    check(value) {
        if (value.length !== this.n) {
            throw new TCError('LengthCheckError', 'LengthCheck: actual length does not equal expected length', { expected: this.n, actual: value.length });
        }
    }
}

module.exports.LengthCheck = LengthCheck;

/**
 * MaxLengthCheck checks that the length of a value with a .length property (e.g. an array or string) is less than a given value
 *
 * @version 1.0.0
 * @extends Check
 */
class MaxLengthCheck extends Check {

    /**
     * Creates a new instance of MaxLengthCheck.
     *
     * @constructor
     * @param {number} n - the maximum allowable length
     */
    constructor(n) {
        super();
        this.n = n;
    }

    /**
     * Checks that the length of the value is the same or less than the length passed to the constructor.
     *
     * @param {object} value - an object with a .length property (e.g. a string, an array, etc).
     * @throws {TCError} MaxLengthCheckError
     */
    check(value) {
        if (value.length > this.n) {
            throw new TCError('MaxLengthCheckError', 'MaxLengthCheck: actual length exceeds max length', { expected: this.n, actual: value.length });
        }
    }
}

module.exports.MaxLengthCheck = MaxLengthCheck;

/**
 * MinLengthCheck checks that the length of a value with a .length property (e.g. an array or string) is less than a given value
 *
 * @version 1.0.0
 * @extends Check
 */
class MinLengthCheck extends Check {

    /**
     * Creates a new instance of MinLengthCheck.
     *
     * @constructor
     * @param {number} n - the minimum allowable length
     */
    constructor(n) {
        super();
        this.n = n;
    }

    /**
     * Checks that the length of the value is the same or greater than the length passed to the constructor.
     *
     * @param {object} value - an object with a .length property (e.g. a string, an array, etc).
     * @throws {TCError} MinLengthCheckError
     */
    check(value) {
        if (value.length < this.n) {
            throw new TCError('MinLengthCheckError', 'MinLengthCheck: actual length less than min length', { expected: this.n, actual: value.length });
        }
    }
}

module.exports.MinLengthCheck = MinLengthCheck;

/**
 * ObjectCheck checks that the object validates against the validation object supplied to the constructor.
 *
 * @version 1.0.0
 * @extends Check
 */
class ObjectCheck extends Check {

    /**
     * Creates a new instance of ObjectCheck.
     *
     * @constructor
     * @param {object} obj - an object with values that are validators.
     */
    constructor(obj) {
        super();
        this.obj = obj;
    }

    /**
     * Checks the validity of values by validating each one against the validators in the object passed to the constructor.
     *
     * @param {object} value - an object.
     * @throws {TCError} ObjectCheckError
     */
    check(value) {
        try {
            Object.keys(this.obj).forEach((key) => this.obj[key].validate(value[key]));
        } catch (err) {
            throw new TCError('ObjectCheckError', 'at least one value in the object did not pass validation', { err });
        }
    }
}

module.exports.ObjectCheck = ObjectCheck;

/**
 * TypeCheck checks that the value has the same type as supplied to the constructor.
 *
 * @version 1.0.0
 * @extends Check
 */
class TypeCheck extends Check {

    /**
     * Creates a new instance of TypeCheck.
     *
     * @constructor
     * @param {string} type - a type such as number, object, string, etc.
     */
    constructor(type = 'undefined') {
        super();
        this.type = type;
    }

    /**
     * Checks the typeof value against the type supplied to the constructor.
     *
     * @param {any} value - a value to check.
     * @throws {TCError} TypeCheckError
     */
    check(value) {
        if (typeof value !== this.type) {
            throw new TCError('TypeCheckError', 'TypeCheck: actual type does not equal expected type', { expected: this.type, actual: typeof value });
        }
    }
}

module.exports.TypeCheck = TypeCheck;

/**
 * PatternCheck checks that the value matches the pattern supplied to the constructor.
 *
 * @version 1.0.0
 * @extends Check
 */
class PatternCheck extends Check {

    /**
     * Creates a new instance of PatternCheck.
     *
     * @constructor
     * @param {string|RegExp} pattern - a regular expression to match against.
     */
    constructor(pattern) {
        super();
        this.pattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    }

    /**
     * Checks the value against the pattern supplied to the constructor.
     *
     * @param {any} value - a value to check.
     * @throws {TCError} PatternCheckError
     */
    check(value) {
        if (!this.pattern.test(value)) {
            throw new TCError('PatternCheckError', 'PatternCheck: actual value does not match pattern', { expected: this.pattern.toString(), actual: value });
        }
    }
}

module.exports.PatternCheck = PatternCheck;

/**
 * ValidatorBase is the basis for all type validators.
 *
 * @version 1.0.0
 */
class ValidatorBase {

    /**
     * Creates a new instance of ValidatorBase.
     *
     * @constructor
     */
    constructor() {
        this.checks = [];
    }

    /**
     * validates the value against a set of checks
     *
     * @param {any} value - a value to validate
     * @throws {TCError} ValidatorError
     */
    validate(value) {
        const checkErrors = [];

        this.checks.forEach((checker) => {
            try {
                checker.check(value);
            } catch (checkError) {
                checkErrors.push(checkError);
            }
        });

        if (checkErrors.length !== 0) {
            throw new TCError('ValidatorError', 'ValidatorBase: one or more validation checks failed', { checkErrors });
        }
    }

}

module.exports.ValidatorBase = ValidatorBase;

/**
 * BooleanValidator validates a boolean
 *
 * @version 1.0.0
 * @extends ValidatorBase
 */
class BooleanValidator extends ValidatorBase {

    /**
     * Creates a new instance of BooleanValidator.
     *
     * @constructor
     */
    constructor() {
        super();
        this.checks.push(new TypeCheck('boolean'));
    }
}

module.exports.BooleanValidator = BooleanValidator;

/**
 * ObjectValidator validates an object
 *
 * @version 1.0.0
 * @extends ValidatorBase
 */
class ObjectValidator extends ValidatorBase {

    /**
     * Creates a new instance of ObjectValidator.
     *
     * @constructor
     */
    constructor(obj = {}) {
        super();
        this.checks.push(new ObjectCheck(obj));
    }
}

module.exports.ObjectValidator = ObjectValidator;

/**
 * StringValidator validates a string
 *
 * @version 1.0.0
 * @extends ValidatorBase
 */
class StringValidator extends ValidatorBase {

    /**
     * Creates a new instance of StringValidator.
     *
     * @constructor
     */
    constructor() {
        super();
        this.checks.push(new TypeCheck('string'));
    }

    /**
     * Checks that the length of the string is exactly n.
     *
     * @param {number} n - desired length of the string.
     * @returns {StringValidator}
     */
    length(n) {
        this.checks.push(new LengthCheck(n));
        return this;
    }

    /**
     * Checks that the length of the string is greater than or equal to n.
     *
     * @param {number} n - minimum length of the string.
     * @returns {StringValidator}
     */
    min(n) {
        this.checks.push(new MinLengthCheck(n));
        return this;
    }

    /**
     * Checks that the length of the string is less than or equal to n.
     *
     * @param {number} n - maximum length of the string.
     * @returns {StringValidator}
     */
    max(n) {
        this.checks.push(new MaxLengthCheck(n));
        return this;
    }

    /**
     * Checks that the string matches the pattern.
     *
     * @param {string|RegExp} pattern - regular expression to match against the string.
     * @returns {StringValidator}
     */
    pattern(pattern) {
        this.checks.push(new PatternCheck(pattern));
        return this;
    }
}

module.exports.StringValidator = StringValidator;

/**
 * Validator builds a validator
 *
 * @version 1.0.0
 */
class Validator {

    /**
     * Builds a boolean validator.
     *
     * @static
     * @returns {BooleanValidator}
     */
    static boolean() {
        return new BooleanValidator();
    }

    /**
     * Builds a string validator.
     *
     * @static
     * @returns {StringValidator}
     */
    static string() {
        return new StringValidator();
    }

    /**
     * Builds an object validator.
     *
     * @static
     * @returns {ObjectValidator}
     */
    static object(obj = {}) {
        return new ObjectValidator(obj);
    }

}

module.exports.Validator = Validator;

/**
 * Http Status Code Numbers
 *
 * @constant {object}
 * @version 1.0.0
 */
const HttpStatusCode = {

    // Information (1xx)
    CONTINUE: 100,
    SWITCHING_PROTOCOL: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,

    // Success (2xx)
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IM_USED: 226,

    // Redirection (3xx)
    MULTIPLE_CHOICE: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    // Client Error (4xx)
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FILEDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,

    // Server Error (5xx)
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
};

module.exports.HttpStatusCode = HttpStatusCode;

/**
 * Http Status Text Strings
 *
 * @constant {object}
 * @version 1.0.0
 */
const HttpStatusText = {

    // Information (1xx)
    CONTINUE: 'Continue',
    SWITCHING_PROTOCOL: 'Switching Protocol',
    PROCESSING: 'Processing',
    EARLY_HINTS: 'Early Hints',

    // Success (2xx)
    OK: 'OK',
    CREATED: 'Created',
    ACCEPTED: 'Accepted',
    NON_AUTHORITATIVE_INFORMATION: 'Anon-Authoritative Information',
    NO_CONTENT: 'No Content',
    RESET_CONTENT: 'Reset Content',
    PARTIAL_CONTENT: 'Partial Content',
    MULTI_STATUS: 'Multi-Status',
    ALREADY_REPORTED: 'Already Reported',
    IM_USED: 'IM Used',

    // Redirection (3xx)
    MULTIPLE_CHOICE: 'Multiple Choice',
    MOVED_PERMANENTLY: 'Moved Permanently',
    FOUND: 'Found',
    SEE_OTHER: 'See Other',
    NOT_MODIFIED: 'Not Modified',
    TEMPORARY_REDIRECT: 'Temporary Redirect',
    PERMANENT_REDIRECT: 'Permanent Redirect',

    // Client Error (4xx)
    BAD_REQUEST: 'Bad Request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not Found',
    METHOD_NOT_ALLOWED: 'Method Not Allowed',
    NOT_ACCEPTABLE: 'Not Acceptable',
    PROXY_AUTHENTICATION_REQUIRED: 'Proxy Authentication Required',
    REQUEST_TIMEOUT: 'Request Timeout',
    CONFLICT: 'Conflict',
    GONE: 'Gone',
    LENGTH_REQUIRED: 'Length Required',
    PRECONDITION_FAILED: 'Precondition Failed',
    PAYLOAD_TOO_LARGE: 'Payload Too Large',
    URI_TOO_LONG: 'URI Too Long',
    UNSUPPORTED_MEDIA_TYPE: 'Unsupported Media Type',
    RANGE_NOT_SATISFIABLE: 'Range Not Satisfiable',
    EXPECTATION_FAILED: 'Expectation Failed',
    IM_A_TEAPOT: 'I\'m a teapot',
    MISDIRECTED_REQUEST: 'Misdirected Request',
    UNPROCESSABLE_ENTITY: 'Unprocessable Entity',
    LOCKED: 'Locked',
    FAILED_DEPENDENCY: 'Failed Dependency',
    TOO_EARLY: 'Too Early',
    UPGRADE_REQUIRED: 'Upgrade Required',
    PRECONDITION_REQUIRED: 'Precondition Required',
    TOO_MANY_REQUESTS: 'Too Many Requests',
    REQUEST_HEADER_FILEDS_TOO_LARGE: 'Request Header Fields Too Large',
    UNAVAILABLE_FOR_LEGAL_REASONS: 'Unavailable For Legel Reasons',

    // Server Error (5xx)
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    NOT_IMPLEMENTED: 'Not Implemented',
    BAD_GATEWAY: 'Bad Gateway',
    SERVICE_UNAVAILABLE: 'Service Unavailable',
    GATEWAY_TIMEOUT: 'Gateway Timeout',
    HTTP_VERSION_NOT_SUPPORTED: 'HTTP Version Not Supported',
    VARIANT_ALSO_NEGOTIATES: 'Variant Also Negotiates',
    INSUFFICIENT_STORAGE: 'Insufficient Storage',
    LOOP_DETECTED: 'Loop Detected',
    NOT_EXTENDED: 'Not Extended',
    NETWORK_AUTHENTICATION_REQUIRED: 'Network Authentication Required',
};

module.exports.HttpStatusText = HttpStatusText;

/**
 * Mime Types
 *
 * @constant {object}
 * @version 1.0.0
 */
const MimeTypes = {
    'aac': 'audio/aac',
    'avi': 'video/x-msvideo',
    'bin': 'application/octet-stream',
    'bz2': 'application/x-bzip2',
    'css': 'text/css',
    'csv': 'text/csv',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'epub': 'application/epub+zip',
    'gz': 'application/gzip',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/vnd.microsoft.icon',
    'ics': 'text/calendar',
    'jar': 'application/java-archive',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'mid': 'udio/midi',
    'midi': 'udio/midi',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'mpeg': 'video/mpeg',
    'odt': 'application/vnd.oasis.opendocument.text',
    'oga': 'audio/ogg',
    'ogv': 'video/ogg',
    'otf': 'font/otf',
    'opus': 'audio/opus',
    'png': 'image/png',
    'pdf': 'application/pdf',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'rar': 'application/vnd.rar',
    'rtf': 'application/rtf',
    'sh': 'application/x-sh',
    'svg': 'image/svg+xml',
    'tar': 'application/x-tar',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'ttf': 'font/ttf',
    'txt': 'text/plain',
    'wav': 'audio/wav',
    'weba': 'audio/weba',
    'webm': 'audio/webm',
    'webp': 'image/webp',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'xhtml': 'application/xhtml+xml',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xml': 'application/xml',
    'zip': 'application/zip',
    '7z': 'application/x-7z-compressed',
};

module.exports.MimeTypes = MimeTypes;

/**
 * Logger logs information messages intended for developers about the software's activities.
 *
 * @version 1.0.0
 */
class Logger {

    /**
     * Creates a new instance of Logger.
     *
     * @constructor
     */
    constructor() {}

    /**
     * Logs a message useful to the test/dev environments.
     *
     * @param {...any} args - any values that should be logged.
     */
    inTestEnv(...args) { }

    /**
     * Logs a message useful to the prod/test/dev environments.
     *
     * @param {...any} args - any values that should be logged.
     */
    inProdEnv(...args) { }

    /**
     * Logs a high priority message that should be seen by a human within the next 24 hours.
     *
     * @param {...any} args - any values that should be logged.
     */
    toInvestigateTomorrow(...args) { }

    /**
     * Logs an urgentmessage that should be seen by a human immediately
     *
     * @param {...any} args - any values that should be logged.
     */
    wakeMeInTheMiddleOfTheNight(...args) { }
}

module.exports.Logger = Logger;

/**
 * Logger logs information messages intended for developers about the software's activities.
 *
 * @version 1.0.0
 * @extends Logger
 */
class ConsoleLogger extends Logger {

    /**
     * Creates a new instance of Logger.
     *
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Logs a message useful to the test/dev environments.
     *
     * @param {...any} args - any values that should be logged.
     */
    inTestEnv(...args) {
        console.log(`[${new Date().toISOString()}][DEBUG] ${args.join(' ')}`);
    }

    /**
     * Logs a message useful to the prod/test/dev environments.
     *
     * @param {...any} args - any values that should be logged.
     */
    inProdEnv(...args) {
        console.log(`[${new Date().toISOString()}][INFO] ${args.join(' ')}`);
    }

    /**
     * Logs a high priority message that should be seen by a human within the next 24 hours.
     *
     * @param {...any} args - any values that should be logged.
     */
    toInvestigateTomorrow(...args) {
        console.log(`[${new Date().toISOString()}][WARN] ${args.join(' ')}`);
    }

    /**
     * Logs an urgentmessage that should be seen by a human immediately
     *
     * @param {...any} args - any values that should be logged.
     */
    wakeMeInTheMiddleOfTheNight(...args) {
        console.log(`[${new Date().toISOString()}][ERROR] ${args.join(' ')}`);
    }
}

module.exports.ConsoleLogger = ConsoleLogger;

/**
 * Controller orchestrates data storage and validation.
 *
 * @version 1.0.0
 */
class Controller {

    /**
     * Creates a new instance of Controller
     *
     * @constructor
     * @param {ObjectValidator} schema - validator for this object type
     * @param {Storage} storage - handles reading/writing data
     * @param {Logger} logger - logs important actions.
     */
    constructor(schema, storage, logger) {
        this.schema = schema;
        this.storage = storage;
        this.logger = logger;
    }

    /**
     * Create the resource
     *
     * @async
     * @param {object} delta - data to create.
     * @return {string|number} resource identifier.
     */
    async create(obj = {}) {
        this.schema.validate(obj);
        return await this.storage.create(obj);
    }

    /**
     * Read the resource
     *
     * @async
     * @param {string} id - resource identifier.
     * @return {object}
     */
    async read(id = '') {
        const result = await this.storage.read(id);
        this.schema.validate(result);
        return result;
    }

    /**
     * Create or update resource
     *
     * @async
     * @param {string} id - resource identifier.
     * @param {object} delta - data to create or update.
     */
    async upsert(id = '', obj = {}) {
        try {
            await this.create(obj);
        } catch (err) {
            await this.update(id, obj);
        }
    }

    /**
     * Update resource
     *
     * @async
     * @param {string} id - resource identifier.
     * @param {object} delta - data to update.
     */
    async update(id = '', obj = {}) {
        this.schema.validate(obj);
        await this.storage.update(id, obj);
    }

    /**
     * Partial update resource
     *
     * @async
     * @param {string} id - resource identifier.
     * @param {object} delta - data to update.
     */
    async patch(id = '', delta = {}) {
        await this.storage.patch(id, delta);
    }

    /**
     * Delete the resource.
     *
     * @async
     * @param {string} id - resource identifier.
     */
    async delete(id = '') {
        await this.storage.delete(id);
    }

    /**
     * List resources.
     *
     * @async
     * @param {object} filter - selects which resources to return.
     * @return {object[]}
     */
    async list(filter = {}) {
        const results = await this.storage.list(filter);
        results.forEach((result) => this.schema.validate(result));
        return results;
    }
}

module.exports.Controller = Controller;

/**
 * JSONPointer implements RFC6901 JavaScript Object Notation (JSON) Pointer
 *
 * @version 1.0.0
 */
class JSONPointer {

    /**
     * set a value in obj in the location pointed to by ptr.
     *
     * @static
     * @param {object} obj - object to set the value in.
     * @param {string} ptr - JSONPointer.
     * @param {any} value - value to set.
     * @throws {TCError} JSONPointerError
     */
    static set(obj, ptr, value) {

        if (typeof obj !== 'object' || obj === null) {
            throw new TCError('JSONPointerError', 'obj must be a non-null object', { obj, ptr });
        }

        if (typeof ptr !== 'string') {
            throw new TCError('JSONPointerError', 'ptr must be a string', { obj, ptr });
        }

        if (ptr === '') {
            return value;
        }

        if (ptr[0] !== '/') {
            throw new TCError('JSONPointerError', 'non-empty ptr must begin with a "/"', { obj, ptr });
        }

        const components = ptr
                                .split('/')                                         // break up /foo/bar into ['foo','bar']
                                .map((component) => component.replace(/~1/g, '/'))  // '~1' to '/'
                                .map((component) => component.replace(/~0/g, '~'))  // '~0' to '~'
                                .slice(1);                                          // chop off array head (which will be '')

        let cur = obj;
        components.slice(0, -1).forEach((component) => {
            if (!['object','array'].includes(typeof cur[component]) || cur[component] === null) {
                cur[component] = {};
            }
            cur = cur[component];
        });
        cur[components[components.length - 1]] = value;

        return obj;
    }

    /**
     * get a value from obj pointed to by ptr.
     *
     * @static
     * @param {object} obj - object to get the value from.
     * @param {string} ptr - JSONPointer.
     * @throws {TCError} JSONPointerError
     */
    static get(obj, ptr) {

        if (typeof obj !== 'object' || obj === null) {
            throw new TCError('JSONPointerError', 'obj must be a non-null object', { obj, ptr });
        }

        if (typeof ptr !== 'string') {
            throw new TCError('JSONPointerError', 'ptr must be a string', { obj, ptr });
        }

        if (ptr === '') {
            return obj;
        }

        if (ptr[0] !== '/') {
            throw new TCError('JSONPointerError', 'non-empty ptr must begin with a "/"', { obj, ptr });
        }

        const components = ptr
                                .split('/')                                         // break up /foo/bar into ['foo','bar']
                                .map((component) => component.replace(/~1/g, '/'))  // '~1' to '/'
                                .map((component) => component.replace(/~0/g, '~'))  // '~0' to '~'
                                .slice(1);                                          // chop off array head (which will be '')

        return components.reduce((result, component) => {
            if (typeof result !== 'object' || result === null) {
                return undefined; // path not found
            }
            return result[component];
        }, obj);
    }

}

module.exports.JSONPointer = JSONPointer;

/**
 * TCTemplate Engine renders templates.
 *
 * @version 1.0.0
 */
class TCTemplate {

    /**
     * Creates a new instance of TCTemplate.
     *
     * @constructor
     * @param {string} template - template to render.
     * @throws {TCError} TCTemplateMustBeStringError
     */
    constructor(template = '') {
        if (typeof template !== 'string') {
            throw new TCError('TCTemplateMustBeStringError', 'template must be a string.', { template });
        }

        this.template = template;
        this.output = '';
        this.inComment = 0;
        this.inFalseIf = 0;
        this.openTags = [];

        this.inForLoop = 0;
        this.forLoopVars = [];
        this.forLoopContents = '';
    }

    /**
     * Internal method called for any TCTemplate start tag
     *
     * @param {string} tag - tag text.
     * @throws {TCError} TCTemplateStartTagMustBeStringError or TCTemplateUnrecognizedStartTagError
     */
    startTag(tag) {

        if (typeof tag !== 'string') {
            throw new TCError('TCTemplateStartTagMustBeStringError', 'start tag must be a string.', { tag });
        }

        if (this.inForLoop !== 0) {
            this.forLoopContents += tag;
            if (tag.startsWith('[for ')) {
                this.inForLoop++;
            }
            return;
        }

        switch (true) {

            case /^\[for [^ ]+ in [^\]]+\]$/i.test(tag):
                this.inForLoop = 1;
                this.forLoopVars = tag.slice(5, -1).split(/ in /);
                break;

            case /^\[comment\]$/i.test(tag):
                this.inComment++;
                break;

            case /^\[if [^\]]+\]$/i.test(tag):
                if (this.inFalseIf || JSONPointer.get(this.locals, tag.slice(4, -1)) !== true) {
                    this.inFalseIf++;
                }
                break;

            default:
                throw new TCError('TCTemplateUnrecognizedStartTagError', 'unrecognized TCTemplate start tag', { tag });

        }

        const actualTag = tag.slice(1).split(/[ =\]]/)[0];
        this.openTags.push(actualTag);

    }

    /**
     * Internal method called for any TCTemplate self closing tag
     *
     * @param {string} tag - tag text.
     * @throws {TCError} TCTemplateSelfClosingTagMustBeStringError or TCTemplateUnrecognizedSelfClosingTagError
     */
    selfClosingTag(tag) {

        if (typeof tag !== 'string') {
            throw new TCError('TCTemplateSelfClosingTagMustBeStringError', 'self closing tag must be a string.', { tag });
        }

        if (this.inForLoop !== 0) {
            this.forLoopContents += tag;
            return;
        }

        if (this.inComment !== 0 || this.inFalseIf !== 0) {
            return;
        }

        switch (true) {

            case /^\[=[^\]]+\]$/i.test(tag):
                this.output += TCTemplate.encodeHtmlEntities( `${JSONPointer.get(this.locals, tag.slice(2, -1))}` );
                break;

            case /^\[-[^\]]+\]$/i.test(tag):
                this.output += `${JSONPointer.get(this.locals, tag.slice(2, -1))}`;
                break;

            default:
                throw new TCError('TCTemplateUnrecognizedSelfClosingTagError', 'unrecognized TCTemplate self closing tag', { tag });
        }

    }

    /**
     * Internal method called for any TCTemplate text that isn't part of a tag.
     *
     * @param {string} txt - text.
     * @throws {TCError} TCTemplateTextMustBeStringError
     */
    text(txt) {
        if (typeof txt !== 'string') {
            throw new TCError('TCTemplateTextMustBeStringError', 'text must be a string.', { tag });
        }

        if (this.inForLoop !== 0) {
            this.forLoopContents += txt;
            return;
        }

        if (this.inComment === 0 && this.inFalseIf === 0) {
            this.output += txt;
        }
    }

    /**
     * Internal method called for any TCTemplate end tag
     *
     * @param {string} tag - tag text.
     * @throws {TCError} TCTemplateEndTagMustBeStringError or TCTemplateUnrecognizedEndTagError or TCTemplateUnbalancedTagsError
     */
    endTag(tag) {

        if (typeof tag !== 'string') {
            throw new TCError('TCTemplateEndTagMustBeStringError', 'end tag must be a string.', { tag });
        }

        if (tag === '[/for]') {
            this.inForLoop--;
        }
        if (this.inForLoop !== 0) {
            this.forLoopContents += tag;
            return;
        }

        switch (tag) {

            case '[/for]':
                const inner = new TCTemplate(this.forLoopContents);
                JSONPointer.get(this.locals, this.forLoopVars[1]).forEach((item) => {
                    JSONPointer.set(this.locals, this.forLoopVars[0], item);
                    this.output += inner.render(this.locals);
                });
                this.forLoopContents = '';
                this.forLoopVars = [];
                break;

            case '[/comment]':
                this.inComment--;
                break;

            case '[/if]':
                if (this.inFalseIf !== 0) {
                    this.inFalseIf--;
                }
                break;

            default:
                throw new TCError('TCTemplateUnrecognizedEndTagError', 'unrecognized TCTemplate end tag', { tag });
        }

        const expectedTag = this.openTags.pop();
        const actualTag = tag.slice(2).split(/[ =\]]/)[0];
        if (expectedTag !== actualTag) {
            throw new TCError('TCTemplateUnbalancedTagsError', 'unbalanced tags', { expectedTag, actualTag });
        }
    }

    /**
     * Internal method called when the template has been fully rendered.
     *
     * @return {string} rendered output
     * @throws {TCError} TCTemplateMissingClosingTagsError
     */
    done() {
        if (this.openTags.length !== 0) {
            throw new TCError('TCTemplateMissingClosingTagsError', 'missing closing tag(s)', { openTags: this.openTags });
        }
        const output = this.output;
        this.output = '';
        return output;
    }

    /**
     * Render the template.
     *
     * @param {object} locals - values for use in the template.
     * @return {string} rendered output
     * @throws {TCError} TCTemplateLocalsMustBeObject
     */
    render(locals = {}) {

        if (typeof locals !== 'object' && locals !== null) {
            throw new TCError('TCTemplateLocalsMustBeObject', 'locals must be a non-null object.', { locals });
        }

        this.locals = locals;
        this.output = '';
        this.openTags = [];

        let token = '';
        let in_tag = false;
        let input = this.template.split('');

        while (input.length > 0) {

            const ch = input.shift();

            if (in_tag && ch === ']') {
                token += ch;
                in_tag = false;
                if (token[1] === '/') {
                    this.endTag(token);
                } else if (token[1] === '=' || token[1] === '-') {
                    this.selfClosingTag(token);
                } else {
                    this.startTag(token);
                }
                token = '';
            } else if (!in_tag && ch === '[') {
                input.unshift(ch);
                in_tag = true;
                if (token.length > 0) {
                    this.text(token);
                }
                token = '';
            } else {
                token += ch;
            }

        }

        this.output += token; // append any trailing text

        return this.done();

    }

    /**
     * Encodes HTML Entities.
     *
     * @static
     * @param {string} input - text to encode.
     * @throws {TCError} TCTemplateEncodeHtmlEntitiesInputMustBeStringError
     */
    static encodeHtmlEntities(input) {
        if (typeof input !== 'string') {
            throw new TCError('TCTemplateEncodeHtmlEntitiesInputMustBeStringError', 'input must be a string.');
        }
        return input.replace(/[\u00A0-\u9999<>\&"']/gim, (ch) => `&#${ch.charCodeAt(0)};`);
    }

}

module.exports.TCTemplate = TCTemplate;


/**
 * Implementation of the MT19937 Random Number Generator Algorithm.
 *
 * @function mtrand
 * @param {number} seed - 32-bit unsigned integer value to use as the seed.
 * @param {number} upper_bound - all results will be less than this number.
 * @returns {Generator}
 * @version 1.0.0
 */
function mtrand(seed, upper_bound) {

    function uint32(n) { // "cast" to unsigned 32-bit integer
        return (new Uint32Array([n]))[0];
    }

    function *_mtrand(seed) {

        // algorithm parameters
        const W =  32;
        const N = 624;
        const M = 397;
        const F = 1812433253;
        const U = 11;
        const D = 0xFFFFFFFF;
        const S = 7;
        const B = 0x9D2C5680;
        const T = 15;
        const C = 0xEFC60000;
        const L = 18;
        const R = 31;
        const HI = (1 << R);
        const LO = (1 << R) - 1;
        const A = 0x9908B0DF;

        // state
        let index;
        const mt = [];

        // initialization
        mt[0] = uint32(seed);
        for (index = 1; index < N; index++) {
            let x = mt[index - 1] ^ (mt[index - 1] >>> 30);
            mt[index] = uint32(
                ((((x & 0xffff0000) >>> 16) * F) << 16) +
                ((((x & 0x0000ffff) >>>  0) * F) <<  0) +
                index
            );
        }

        // main loop
        do {
            // do the twist
            for (index = 0; index < N; index++) {
                const x = uint32((mt[index] & HI) + (mt[(index + 1) % N] & LO));
                mt[index] = (mt[(index + M) % N] ^ x >>> 1);
                mt[index] = uint32((x & 1) ? (mt[index] ^ A) : mt[index]);
            }

            // yield some results
            for (index = 0; index < N; index++) {
                let y = mt[index];
                y ^= (y >>> U);
                y ^= (y << S) & B;
                y ^= (y << T) & C;
                y ^= (y >>> L);
                yield uint32(y);
            }
        } while (true);

    }

    function *_mtrand_uniform(seed, upper_bound) {

        const MTRAND_MAX = 0xFFFFFFFF;
        const limit = MTRAND_MAX - (((MTRAND_MAX % upper_bound) + 1) % upper_bound);

        const rng = mtrand(seed);
        do {
            const n = rng.next().value;
            if (n > limit) {
                continue;
            }
            yield n % upper_bound;
        } while (true);
    }

    if (arguments.length === 2) {
        return _mtrand_uniform(seed, upper_bound);
    } else {
        return _mtrand(seed);
    }
}

module.exports.mtrand = mtrand;

/**
 * Random number generator for CombUUID.
 * not secure, but it doesn't need to be unguessable.
 *
 * @version 1.0.0
 * @private
 */
const comb_rng = mtrand(new Date().getTime(), 256);

/**
 * Implements COMB UUIDs (UUID v4 Variant B) which sort to chronological order.
 *
 * @version 1.0.0
 */
class CombUUID {

    /**
     * Generate a new COMB UUID hex string
     *
     * @static
     * @param {Date} now - timestamp for this UUID
     * @returns {string}
     */
    static encode(now = new Date()) {

        if (!(now instanceof Date)) {
            now = new Date(now);
        }

        // timestamp
        const timestamp_js = now.getTime();
        const timestamp_bin = timestamp_js * 100;
        const timestamp_hex = timestamp_bin.toString(16);
        const ts1 = timestamp_hex.substring(0, 8);
        const ts2 = timestamp_hex.substring(8, 13);

        // version
        const version = '4';
        const variant = 'b';

        // random
        const bytes = Buffer.alloc(18);
        for (let i = 0; i < 18; i++) {
            bytes.writeUInt8(comb_rng.next().value, i);
        }

        const bytes_hex = bytes.toString('hex');
        const r1 = bytes_hex.substring(0, 3);
        const r2 = bytes_hex.substring(3, 6);
        const r3 = bytes_hex.substring(6, 18);

        return `${ts1}-${ts2}-${version}${r1}-${variant}${r2}-${r3}`;
    }

    /**
     * Decodes a COMB UUID hex string
     *
     * @param {string} uuid - hex string.
     * @returns {object} pieces of the UUID decoded version (string), variant (string), timestamp (integer), timestamp_js (Date), random (hex string)
     */
    static decode(uuid) {

        const uuid_hex = `${uuid}`.toLowerCase().replace(/[^0-9a-f]/g, ''); // string all non-hex characters
        if (uuid_hex.length !== 32) {
            throw new Error('Invalid UUID not length 32 when non-hex characters removed');
        }

        // timestamp
        const timestamp_hex = uuid_hex.substring(0, 12);
        const timestamp = parseInt(timestamp_hex, 16);
        const timestamp_ms = timestamp / 100;
        const timestamp_js = new Date(timestamp_ms);

        // version
        const version = uuid_hex.substring(12, 13);
        const variant = uuid_hex.substring(16, 17);

        // random
        const random = `${uuid_hex.substring(13,16)}${uuid_hex.substring(17)}`;

        return {
            version,
            variant,
            timestamp,
            timestamp_js,
            random,
        };

    }
}

module.exports.CombUUID = CombUUID;

/**
 * Route represents an HTTP route (method + path + handler)
 *
 * @version 1.0.0
 */
class Route {

    /**
     * Creates a new instance of Route
     *
     * @constructor
     * @param {object} obj - parameters (method - HTTP method name, pattern - string or RegExp to match, hander - async function to handle the request)
     */
    constructor(obj = {}) {

        if (typeof obj !== 'object') {
            obj = {};
        }

        this.method = (typeof obj.method === 'string' || Array.isArray(obj.method)) ? obj.method : ['GET','HEAD'];
        if (!Array.isArray(this.method)) {
            this.method = [this.method];
        }
        this.method = this.method.map((method) => method.toUpperCase());

        this.pattern = obj.pattern || /^.*$/;

        this.handler = obj.handler || (async (req, res) => {});
        if (typeof this.handler !== 'function') {
            this.handler = (async (req, res) => {});
        }

    }

    /**
     * Matches this route against a given method and URL path
     *
     * @param {string} method - http method
     * @param {string} remoteUrl - URL path
     * @return {boolean}
     */
    match(method = 'GET', remoteUrl = '/') {

        // match method?
        if (!this.method.includes(method.toUpperCase())) {
            return false;
        }

        // match pattern?
        if (this.pattern instanceof RegExp) {
            return this.pattern.test(remoteUrl);
        } else if (typeof this.pattern === 'string') {
            return this.pattern === remoteUrl;
        }

        return false;
    }
}

module.exports.Route = Route;

/**
 * Collects data from a stream into one UTF-8 string.
 * When contentType is application/json, it is parsed into an object
 *
 * @param {string} contentType - type of the content (e.g. 'application/json').
 * @param {Stream} stream - a stream object.
 */
async function bodyParser(contentType, stream) {

    return await new Promise((resolve, reject) => {
        let body = '';

        stream.setEncoding('utf-8');
        stream.on('data', (chunk) => body += chunk.toString());
        stream.on('err', (err) => reject(err));
        stream.on('end', () => {
            switch (contentType) {
                case 'application/json':
                    body = JSON.parse(body);
                    break;
                default:
                    break;
            }
            resolve(body);
        });
    });
}

module.exports.bodyParser = bodyParser;

/**
 * Storage engine interface
 *
 * @version 1.0.0
 */
class Storage {

    /**
     * Creates a new instance of Storage
     *
     * @constructor
     * @param {object} opts - options for the storage engine.
     */
    constructor(opts = {}) {
        this.opts = typeof opts === 'object' && opts !== null ? opts : {};
    }

    /**
     * Create the record in the storage engine
     *
     * @param {object} obj - object to store.
     * @throws {TCError} NotImplementedError
     */
    async create(obj) {
        throw new TCError('NotImplementedError', 'Storage.create(obj)');
    }

    /**
     * Read the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @throws {TCError} NotImplementedError
     */
    async read(id) {
        throw new TCError('NotImplementedError','Storage.read(id)');
    }

    /**
     * Update the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @param {object} obj - object to store.
     * @throws {TCError} NotImplementedError
     */
    async update(id, obj) {
        throw new TCError('NotImplementedError','Storage.update(id, obj)');
    }

    /**
     * Create or Update the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @param {object} obj - object to store.
     * @throws {TCError} NotImplementedError
     */
    async upsert(id, obj) {
        throw new TCError('NotImplementedError','Storage.upsert(id, obj)');
    }

    /**
     * Partial Update of the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @param {object} delta - changes to apply.
     * @throws {TCError} NotImplementedError
     */
    async patch(id, delta) {
        throw new TCError('NotImplementedError','Storage.patch(id, delta)');
    }

    /**
     * Delete the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @throws {TCError} NotImplementedError
     */
    async delete(id) {
        throw new TCError('NotImplementedError','Storage.delete(id)');
    }

    /**
     * List records in the storage engine.
     *
     * @param {object} filter - selects which records to return.
     * @throws {TCError} NotImplementedError
     */
    async list(filter) {
        throw new TCError('NotImplementedError','Storage.list(filter)');
    }

}

module.exports.Storage = Storage;

/**
 * HttpReqResDecorator allows (req,res) to be decorated for additional functionality.
 * Set headers, add functions (e.g. res.render()), etc.
 *
 * @version 1.0.0
 */
class HttpReqResDecorator {

    /**
     * Creates a new instance of HttpReqResDecorator
     *
     * @constructor
     */
    constructor() {}

    /**
     * Adds functionality to req and/or res
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {}
}

module.exports.HttpReqResDecorator = HttpReqResDecorator;

/**
 * UrlHttpReqResDecorator adds URL components to req.
 *
 * @version 1.0.0
 * @extends HttpReqResDecorator
 */
class UrlHttpReqResDecorator extends HttpReqResDecorator {

    /**
     * Creates a new instance of UrlHttpReqResDecorator
     *
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Adds the parsed request URL parts (href, host, port, protocol, etc to req.
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {
        // parse req.url and expose it on req
        const url = new URL(`http://${req.url}`);

        [
            'href',
            'origin',
            'protocol',
            'username',
            'password',
            'host',
            'hostname',
            'port',
            'pathname',
            'search',
            'searchParams',
            'hash',
        ].forEach(property => req[property] = url[property]);
    }
}

module.exports.UrlHttpReqResDecorator = UrlHttpReqResDecorator;

/**
 * ControllersHttpReqResDecorator adds req.controllers
 *
 * @version 1.0.0
 * @extends HttpReqResDecorator
 */
class ControllersHttpReqResDecorator extends HttpReqResDecorator {

    /**
     * Creates a new instance of ControllersHttpReqResDecorator
     *
     * @constructor
     * @param {object} controllers - an object with controllers in it.
     */
    constructor(controllers = {}) {
        super();
        this.controllers = controllers;
    }

    /**
     * Adds controllers to req
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {
        req.controllers = this.controllers;
    }
}

module.exports.ControllersHttpReqResDecorator = ControllersHttpReqResDecorator;

/**
 * XRequestIDHttpReqResDecorator adds the X-Request-ID response header and sets req.request_id.
 * Log the request_id so that you can correlate the request with the actions performed.
 *
 * @version 1.0.0
 * @extends HttpReqResDecorator
 */
class XRequestIDHttpReqResDecorator extends HttpReqResDecorator {

    /**
     * Creates a new instance of XRequestIDHttpReqResDecorator
     *
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * adds the X-Request-ID response header and sets req.request_id
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {
        req.request_id = CombUUID.encode();
        res.setHeader('X-Request-ID', req.request_id);
    }
}

module.exports.XRequestIDHttpReqResDecorator = XRequestIDHttpReqResDecorator;

/**
 * LoggerHttpReqResDecorator adds req.log.
 *
 * @version 1.0.0
 * @extends HttpReqResDecorator
 */
class LoggerHttpReqResDecorator extends HttpReqResDecorator {

    /**
     * Creates a new instance of LoggerHttpReqResDecorator
     *
     * @constructor
     * @param {Logger} logger - a logger instance.
     */
    constructor(logger = new Logger()) {
        super();
        this.logger = logger;
    }

    /**
     * adds this.logger to req.logger
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {
        req.logger = this.logger;
    }
}

module.exports.LoggerHttpReqResDecorator = LoggerHttpReqResDecorator;

/**
 * JsonHttpReqResDecorator adds req.json(obj)
 *
 * @version 1.0.0
 * @extends HttpReqResDecorator
 */
class JsonHttpReqResDecorator extends HttpReqResDecorator {

    /**
     * Creates a new instance of JsonHttpReqResDecorator
     *
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * adds req.json(obj)
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {
        // JSON output
        res.json = (json) => {
            const body = JSON.stringify(json, null, 4);
            res.writeHead(HttpStatusCodes.OK, HttpStatusText.OK, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'application/json',
            });
            res.end(body);
        };
    }
}

module.exports.JsonHttpReqResDecorator = JsonHttpReqResDecorator;
