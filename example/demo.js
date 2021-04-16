'use strict';

const path = require('path');

const {
    ConsoleLogger,
    Router,
    ControllersHttpReqResDecorator,
    JsonHttpReqResDecorator,
    LoggerHttpReqResDecorator,
    RenderHttpReqResDecorator,
    UrlHttpReqResDecorator,
    XRequestIDHttpReqResDecorator,
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

const decorators = [
    new UrlHttpReqResDecorator(),
    new ControllersHttpReqResDecorator({
        todo: new ToDoController(),
    }),
    new XRequestIDHttpReqResDecorator(),
    new LoggerHttpReqResDecorator({ logger }),
    new JsonHttpReqResDecorator(),
    new RenderHttpReqResDecorator(),
];

const router = new Router({
    decorators,
    logger,
});


router.get('/', async (req, res) => {
    await res.render('Hello, World!');
});


new Server({
    router,
}).listen(3000, () => logger.inProdEnv('Listening...'));

process.on('exit', () => logger.inProdEnv('Exiting...'));
