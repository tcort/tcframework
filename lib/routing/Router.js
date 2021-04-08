'use strict';

const CombUUID = require('../utils/CombUUID');
const { StatusCode, StatusText } = require('../refdata/HttpStatusCodes');
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

        // templating
        res.locals = res.locals || {}; // template variables
        res.render = (template) => { // template rendering - pass a template string or TCTemplate object
            template = template instanceof TCTemplate ? template : new TCTemplate(template);

            const body = template.render(res.locals);
            res.writeHead(StatusCode.OK, StatusText.OK, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'text/html',
            });
            res.end(body);
        };

        // JSON output
        res.json = (json) => {
            const body = JSON.stringify(json, null, 4);
            res.writeHead(StatusCode.OK, StatusText.OK, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'application/json',
            });
            res.end(body);
        };

        res.setHeader('X-Request-ID', CombUUID.encode());

        const route = this.routes.find((route) => route.match(req.method, req.pathname));
        if (route) {
            req.params = route.pattern.exec(req.pathname).groups || {};
            try {
                await route.handler(req, res);
            } catch (err) {
                this.logger.wakeMeInTheMiddleOfTheNight(StatusText.INTERNAL_SERVER_ERROR, err);
                res.writeHead(StatusCode.INTERNAL_SERVER_ERROR, StatusText.INTERNAL_SERVER_ERROR, {
                    'Content-Length': Buffer.byteLength(StatusText.INTERNAL_SERVER_ERROR),
                    'Content-Type': 'text/plain'
                });
                res.end(StatusText.INTERNAL_SERVER_ERROR);
            }
            return true;
        }
        return false;
    }

}

module.exports = Router;
