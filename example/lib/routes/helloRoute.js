'use strict';

const { Route } = require('../../..');

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

module.exports = helloRoute;
