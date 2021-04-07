'use strict';

const http = require('http');

class Server {

    constructor(opts = {}) {
        this.router = opts.router || ({ route: async (req, res) => {} });

        this.server = http.createServer(async (req, res) => {
            const routed = await this.router.route(req, res);
            if (routed) { // an internal route handled the request.
                return;
            }
            const NOT_FOUND = 'Not Found';
            res.writeHead(404, NOT_FOUND, {
                'Content-Length': Buffer.byteLength(NOT_FOUND),
                'Content-Type': 'text/plain',
            });
            res.end(NOT_FOUND);
        });
    }

    listen() {
        return this.server.listen.apply(this.server, arguments);
    }

}

module.exports = Server;
