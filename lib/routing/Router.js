'use strict';

const Route = require('./Route');
const Logger = require('../logging/Logger');
const TCTemplate = require('../templating/TCTemplate');

class Router {

    constructor(obj = {}) {

        if (typeof obj !== 'object') {
            obj = {};
        }

        this.routes = Array.isArray(obj.routes) ? obj.routes.map((route) => new Route(route)) : [];
        this.logger = obj.logger instanceof Logger ? obj.logger : new Logger();
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

        res.locals = res.locals || {}; // template variables
        res.render = (template) => { // template rendering - pass a template string or TCTemplate object
            template = template instanceof TCTemplate ? template : new TCTemplate(template);

            const body = template.render(res.locals);
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'text/html',
            });
            res.end(body);
        };

        const route = this.routes.find((route) => route.match(req.method, req.pathname));
        if (route) {
            req.params = route.pattern.exec(req.pathname).groups || {};
            try {
                await route.handler(req, res);
            } catch (err) {
                this.logger.wakeMeInTheMiddleOfTheNight('Internal Server Error', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
            return true;
        }
        return false;
    }

}

module.exports = Router;
