'use strict';

const {
    Route,
    Router,
} = require('..');
const Server = require('./lib/Server');


const router = new Router();

const helloRoute = new Route({
    method: 'GET',
    pattern: '^/hello/(?<name>[A-Za-z]+)$',
    handler: async (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
        });
        res.end(`Hello, ${req.params.name}!`);
    },
});

router.register(helloRoute);

const server = new Server({
    router,
});

server.listen(3000, () => {
    console.log('listening. Visit http://localhost:3000/hello/Alice');
});
