'use strict';

const path = require('path');
const {
    ConsoleLogger,
    JSONStorage,
    Server,
    StaticFilesRoute,
    Router,
} = require('..');

// import out controllers and routes
const { ToDoController } = require('./lib/controllers');
const { IndexRoute, ToDoReadRoute } = require('./lib/routes');

// create a router
const logger = new ConsoleLogger();
const router = new Router({
    controllers: {
        todo: new ToDoController(new JSONStorage(), logger),
    },
    viewsdir: path.join(__dirname, 'views'),
    logger
});

// register routes
router.register(new IndexRoute({}));
router.register(new ToDoReadRoute({}));
router.register(new StaticFilesRoute({
    mountpoint: '/',
    filesdir: path.join(__dirname, 'public'),
}));

new Server({ router }).listen(3000, () => logger.inProdEnv('Listening...'));
process.on('exit', () => logger.inProdEnv('Exiting...'));
