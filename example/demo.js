'use strict';

const path = require('path');
const {
    ConsoleLogger,
    JSONStorage,
    Server,
    StaticFilesRoute,
    Router,
} = require('..');

const { ToDoController } = require('./lib/controllers');


// setup logging
const logger = new ConsoleLogger();

// setup storage
const storage = new JSONStorage({ basedir: path.join(__dirname, 'storage') });

// controllers
const todo = new ToDoController(storage, logger);

// setup router
const router = new Router({
    controllers: { todo },
    viewsdir: path.join(__dirname, 'views'),
    logger,
});

// routes
router.get('/', async (req, res) => {
    await res.renderFile('index.tct');
});

// GET /todos/:id
router.get(/^\/todos\/(?<id>[A-Za-z0-9-]+)$/, async (req, res) => {
    res.json(await req.controllers.todo.read(req.params.id));
});

new Server({ router }).listen(3000, () => logger.inProdEnv('Listening...'));
process.on('exit', () => logger.inProdEnv('Exiting...'));
