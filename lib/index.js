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
    HttpStatusCodes,
} = require('./refdata');

const {
    Route,
    Router,
} = require('./routing');

const {
    Server,
} = require('./servers');

const {
    JSONStorage,
    Storage,
} = require('./storage');

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

    // reference data
    HttpStatusCodes,

    // routing
    Route,
    Router,

    // servers
    Server,

    // storage
    JSONStorage,
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
