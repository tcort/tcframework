'use strict';

const path = require('path');
const {
    ConsoleLogger,
    JSONStorage,
    Server,
    Router,
} = require('..');
const { ToDoController } = require('./lib/controllers');
const { ToDoRoutes } = require('./lib/routes');

const logger = new ConsoleLogger();
const router = new Router({
    controllers: {
        todo: new ToDoController(new JSONStorage(), logger),
    },
    logger
});
router.register(ToDoRoutes);

new Server({
    router,
 }).listen(3000, () => logger.inProdEnv('Listening...'));

process.on('exit', () => logger.inProdEnv('Exiting...'));
