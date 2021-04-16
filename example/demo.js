'use strict';

const path = require('path');

const {
    ConsoleLogger,
} = require('../tcframework.core');
const {
    JSONStorage,
    Server,
} = require('../tcframework.node');
const {
    ToDoController,
} = require('./lib/controllers');

// setup logging
const logger = new ConsoleLogger();

logger.inTestEnv('Hello, World!');

// setup storage
const storage = new JSONStorage({ basedir: path.join(__dirname, 'storage') });

new Server({
    /* router */,
}).listen(3000, () => logger.inProdEnv('Listening...'));
process.on('exit', () => logger.inProdEnv('Exiting...'));
