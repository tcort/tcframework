'use strict';

const Route = require('./Route');

class Router {

    constructor(obj = {}) {

        if (typeof obj !== 'object') {
            obj = {};
        }

        this.routes = Array.isArray(obj.routes) ? obj.routes.map((route) => new Route(route)) : [];
    }

    register(routes) {
        this.routes = this.routes.concat(routes);
    }

    async route(req, res) {
        // parse req.url and expose it on req
        const url = new URL(`http://${req.headers.host || 'localhost'}${req.url}`);

        [
            'href',
            'origin',
            'protocol',
            'username',
            'password',
            'host',
            'hostname',
            'port',
            'pathname',
            'search',
            'searchParams',
            'hash',
        ].forEach(property => req[property] = url[property]);

        const route = this.routes.find((route) => route.match(req.method, req.pathname));
        if (route) {
            req.params = route.pattern.exec(req.pathname).groups || {};
            await route.handler(req, res);
            return true;
        }
        return false;
    }

}

module.exports = Router;
