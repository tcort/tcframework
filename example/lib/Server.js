'use strict';

const http = require('http');

class Server {

    constructor(opts = {}) {
        this.router = opts.router || (async (req, res) => {});

        this.server = http.createServer(async (req, res) => {
            const routed = await this.router.route(req, res);
            if (routed) { // an internal route handled the request.
                return;
            }
            res.writeHead(404, 'Not Found', { 'Content-Type': 'text/plain' });
            res.write('Not Found');
            res.end(); 
        });
    }

    listen() {
        return this.server.listen.apply(this.server, arguments);
    }

}

module.exports = Server;
