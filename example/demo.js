'use strict';

const {
    ConsoleLogger,
    Router,
} = require('..');

const helloRoute = require('./lib/routes/helloRoute');
const Server = require('./lib/Server');

const logger = new ConsoleLogger();

const router = new Router({ logger });
router.register(helloRoute);

new Server({ router }).listen(3000, () => logger.inProdEnv('listening. Visit http://localhost:3000/hello/Alice'));

process.on('exit', () => logger.inProdEnv('Exiting...'));
