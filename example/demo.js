'use strict';

const { Router } = require('..');
const helloRoute = require('./lib/routes/helloRoute');
const Server = require('./lib/Server');

const router = new Router();
router.register(helloRoute);

const server = new Server({ router });
server.listen(3000, () => console.log('listening. Visit http://localhost:3000/hello/Alice'));
