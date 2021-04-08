'use strict';

const { Route } = require('../../..');

const routes = [
    new Route({
        method: 'GET',
        pattern: '^/todos/(?<id>[A-Za-z]+)$',
        handler: async (req, res) => {
            res.locals.id = req.params.id;
            res.render(`Hello, [=/id]`);
        },
    }),
];

module.exports = routes;
