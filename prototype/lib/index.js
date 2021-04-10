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
    MimeTypes,
} = require('./refdata');

const {
    Route,
    Router,
    StaticFilesRoute,
} = require('./routing');

const {
    Server,
} = require('./servers');

const {
    JSONStorage,
    MemoryStorage,
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
    MimeTypes,

    // routing
    Route,
    Router,
    StaticFilesRoute,

    // servers
    Server,

    // storage
    JSONStorage,
    MemoryStorage,
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
