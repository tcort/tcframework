'use strict';

const CombUUID = require('../utils/CombUUID');
const { StatusCode, StatusText } = require('../refdata/HttpStatusCodes');
const Route = require('./Route');
const Logger = require('../logging/Logger');
const TCTemplate = require('../templating/TCTemplate');
const fs = require('fs').promises;
const path = require('path');

class Router {

    constructor(obj = {}) {

        if (typeof obj !== 'object' || obj === null) {
            obj = {};
        }

        this.controllers = typeof obj.controllers === 'object' && obj.controllers !== null ? obj.controllers : {};
        this.routes = Array.isArray(obj.routes) ? obj.routes.map((route) => new Route(route)) : [];
        this.logger = obj.logger instanceof Logger ? obj.logger : new Logger();
        this.viewsdir = typeof obj.viewsdir === 'string' ? obj.viewsdir : path.join(path.sep, 'tmp', 'views');
        this.views = [];
    }

    register(method, pattern, route) {
        if (!(route instanceof Route) && typeof route === 'function') {
            route = new Route({ handler: route });
        }
        route.method = Array.isArray(method) ? method : [method];
        route.pattern = pattern || new RegExp(/^.*$/);
        this.routes.push(route);
    }

    post(pattern, route) {
        this.register('POST', pattern, route);
    }

    options(pattern, route) {
        this.register('OPTIONS', pattern, route);
    }

    put(pattern, route) {
        this.register('PUT', pattern, route);
    }

    get(pattern, route) {
        this.register(['GET','HEAD'], pattern, route);
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
        req.controllers = this.controllers;

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

        res.renderFile = async (view) => {
            view = path.basename(view);
            if (!this.views.hasOwnProperty(view)) {
                const filepath = path.join(this.viewsdir, path.basename(view));
                const file = await fs.readFile(filepath);
                this.views[view] = new TCTemplate(file.toString());
            }
            res.render(this.views[view]);
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
            req.params = route.pattern instanceof RegExp ? (route.pattern.exec(req.pathname).groups || {}) : {};
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
