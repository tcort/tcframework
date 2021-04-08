'use strict';

const {
    ConsoleLogger,
    JSONStorage,
    Server,
    Router,
} = require('..');
const { ToDoController } = require('./lib/controllers');
const { ToDoRoutes } = require('./lib/routes');
const path = require('path');

const storage = new JSONStorage({ basedir: path.join(path.sep, 'tmp'), pk: 'id' });
const logger = new ConsoleLogger();
const controllers = {
    todo: new ToDoController(storage, logger),
};

const router = new Router({ controllers, logger });
router.register(ToDoRoutes);

new Server({ router }).listen(3000, () => logger.inProdEnv('listening. Visit http://localhost:3000/hello/Alice'));

process.on('exit', () => logger.inProdEnv('Exiting...'));
