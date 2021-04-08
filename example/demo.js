'use strict';

const path = require('path');
const {
    ConsoleLogger,
    JSONStorage,
    Server,
    StaticFilesRoute,
    Router,
} = require('..');

// import out controllers
const { ToDoController } = require('./lib/controllers');

// create a router
const logger = new ConsoleLogger();
const router = new Router({
    controllers: {
        todo: new ToDoController(new JSONStorage(), logger),
    },
    viewsdir: path.join(__dirname, 'views'),
    logger
});

// routes
router.get('/', async (req, res) => {
    await res.renderFile('index.tct');
});

new Server({ router }).listen(3000, () => logger.inProdEnv('Listening...'));
process.on('exit', () => logger.inProdEnv('Exiting...'));
