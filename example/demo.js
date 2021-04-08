'use strict';

const {
    ConsoleLogger,
    JSONStorage,
    Server,
    Router,
} = require('..');
const ToDoController = require('./lib/controllers/ToDoController');
const path = require('path');

const routes = require('./lib/routes/todo');
const storage = new JSONStorage({ basedir: path.join(path.sep, 'tmp'), pk: 'id' });
const logger = new ConsoleLogger();
const toDoController = new ToDoController(storage, logger);

const router = new Router({ logger });
router.register(routes);

new Server({ router }).listen(3000, () => logger.inProdEnv('listening. Visit http://localhost:3000/hello/Alice'));

process.on('exit', () => logger.inProdEnv('Exiting...'));
