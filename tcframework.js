
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
 * @file TC Framework
 * @copyright Copyright (c) 2021 Thomas Cort <linuxgeek@gmail.com>
 * @license ISC
 */

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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * @private
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
     * @returns {BooleanValidator}
     */
    static boolean() {
        return new BooleanValidator();
    }

    /**
     * Builds a string validator.
     *
     * @returns {StringValidator}
     */
    static string() {
        return new StringValidator();
    }

    /**
     * Builds an object validator.
     *
     * @returns {ObjectValidator}
     */
    static object(obj = {}) {
        return new ObjectValidator(obj);
    }

}

module.exports.Validator = Validator;
