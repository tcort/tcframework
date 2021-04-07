'use strict';

const { Route } = require('../../..');

const helloRoute = new Route({
    method: 'GET',
    pattern: '^/hello/(?<name>[A-Za-z]+)$',
    handler: async (req, res) => {
        res.locals.name = req.params.name;
        res.render(`Hello, [=/name]`);
    },
});

module.exports = helloRoute;
