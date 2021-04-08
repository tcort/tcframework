'use strict';

const http = require('http');
const { StatusCode, StatusText } = require('../../lib/refdata/HttpStatusCodes');

class Server {

    constructor(opts = {}) {
        this.router = opts.router || ({ route: async (req, res) => {} });

        this.server = http.createServer(async (req, res) => {
            const routed = await this.router.route(req, res);
            if (routed) { // an internal route handled the request.
                return;
            }
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
