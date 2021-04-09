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

    res.locals.todos = (await req.controllers.todo.list()).reverse();

    await res.renderFile('index.tct');
});

// Create - POST /todos/:id
router.post('/todos', async (req, res) => {
    const id = await req.controllers.todo.create(req.body);

    res.setHeader('Location', `/todos/${id}`);
    res.json(await req.controllers.todo.read(id));
});

// Read - GET /todos/:id
router.get(/^\/todos\/(?<id>[A-Za-z0-9-]+)$/, async (req, res) => {
    res.json(await req.controllers.todo.read(req.params.id));
});

// Update (or create) - PUT /todos/:id
router.put(/^\/todos\/(?<id>[A-Za-z0-9-]+)$/, async (req, res) => {
    await req.controllers.todo.upsert(req.params.id, req.body);
    res.json(await req.controllers.todo.read(req.params.id));
});

// Delete - DELETE /todos/:id
router.delete(/^\/todos\/(?<id>[A-Za-z0-9-]+)$/, async (req, res) => {
    await req.controllers.todo.delete(req.params.id);
    res.json({ status: 'ok' });
});

router.use(new StaticFilesRoute({
    filesdir: path.join(__dirname, 'public'),
    mountpoint: '/',
}));

new Server({ router }).listen(3000, () => logger.inProdEnv('Listening...'));
process.on('exit', () => logger.inProdEnv('Exiting...'));
