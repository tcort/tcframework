'use strict';

const {
    Controller,
} = require('./controllers');

const {
    CheckError,
    ExpectationError,
    JSONPointerError,
    NotImplementedError,
    TestError,
    ValidationError,
} = require('./errors');

const {
    ConsoleLogger,
    Logger,
} = require('./logging');

const {
    Storage,
} = require('./storage');

const {
    Route,
    Router,
} = require('./routing');

const {
    expect,
    TestCase,
    TestSuite,
} = require('./testing');

const {
    CombUUID,
    JSONPointer,
    mtrand,
} = require('./utils');

const {
    Validator,
} = require('./validators');


// Public API
module.exports = {
    // controllers
    Controller,

    // errors
    CheckError,
    ExpectationError,
    JSONPointerError,
    NotImplementedError,
    TestError,
    ValidationError,

    // logging
    ConsoleLogger,
    Logger,

    // routing
    Route,
    Router,

    // storage
    Storage,

    // testing
    expect,
    TestCase,
    TestSuite,

    // utils
    CombUUID,
    JSONPointer,
    mtrand,

    // validators
    Validator,
};
