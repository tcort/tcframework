
/*
    TCFramework
    Copyright (c) 2021 Thomas Cort <linuxgeek@gmail.com>

    Permission to use, copy, modify, and distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

/**
 * @file TC Framework Node
 * @copyright Copyright (c) 2021 Thomas Cort <linuxgeek@gmail.com>
 * @license ISC
 */

'use strict';

// extend core with node specific code
module.exports = require('./tcframework.core');

const http = require('http');
const {
    HttpStatusCodes,
    HttpStatusText,
    bodyParser,
} = module.exports;

/**
 * Server provides an http server which is wired into the supplied router
 * @version 1.0.0
 */
class Server {

    /**
     * Creates a new instance of Server
     *
     * @constructor
     * @param {object} opts - options object, router is the only supported option.
     */
    constructor(opts = {}) {
        this.router = opts.router || ({ route: async (req, res) => { return false; } });

        this.server = http.createServer(async (req, res) => {
            // parse input body
            req.body = await bodyParser(req.headers['content-type'], req);

            // route the incoming request
            const routed = await this.router.route(req, res);
            if (routed) { // an internal route handled the request.
                return;
            }

            // not routed (i.e. route not found)
            res.writeHead(HttpStatusCodes.NOT_FOUND, HttpStatusText.NOT_FOUND, {
                'Content-Length': Buffer.byteLength(HttpStatusText.NOT_FOUND),
                'Content-Type': 'text/plain',
            });
            res.end(HttpStatusText.NOT_FOUND);
        });
    }

    /**
     * listen for http requests on a given port.
     * same semantics as node's server.listen().
     */
    listen() {
        return this.server.listen.apply(this.server, arguments);
    }

}

module.exports.Server = Server;
