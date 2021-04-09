'use strict';

const http = require('http');
const { StatusCode, StatusText } = require('../refdata/HttpStatusCodes');
const bodyParser = require('./body-parser');

class Server {

    constructor(opts = {}) {
        this.router = opts.router || ({ route: async (req, res) => {} });

        this.server = http.createServer(async (req, res) => {
            // parse input body
            req.body = await bodyParser(req.headers['content-type'], req);

            // route the incoming request
            const routed = await this.router.route(req, res);
            if (routed) { // an internal route handled the request.
                return;
            }

            // not routed (i.e. route not found)
            res.writeHead(StatusCode.NOT_FOUND, StatusText.NOT_FOUND, {
                'Content-Length': Buffer.byteLength(StatusText.NOT_FOUND),
                'Content-Type': 'text/plain',
            });
            res.end(StatusText.NOT_FOUND);
        });
    }

    listen() {
        return this.server.listen.apply(this.server, arguments);
    }

}

module.exports = Server;
