
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

const fs = require('fs').promises;
const http = require('http');
const path = require('path');
const {
    CombUUID,
    HttpStatusCode,
    HttpStatusText,
    HttpReqResDecorator,
    MimeTypes,
    Route,
    Storage,
    TCTemplate,
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
            res.writeHead(HttpStatusCode.NOT_FOUND, HttpStatusText.NOT_FOUND, {
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

/**
 * JSONStorage engine.
 *
 * stores objects as JSON files on the file system.
 *
 * @version 1.0.0
 */
class JSONStorage extends Storage {

    /**
     * Creates a new instance of JSONStorage
     *
     * @constructor
     * @param {object} opts - options for the storage engine. Opts are pk (primary key) and basedir (path to storage location)
     */
    constructor(opts = {}) {
        super(opts);

        this.opts.pk = typeof opts.pk === 'string' ? opts.pk : 'id';
        this.opts.basedir = typeof opts.basedir === 'string' ? opts.basedir : path.join(path.sep, 'tmp');
    }

    /**
     * Constructs the path to a particular object's JSON file.
     *
     * @param {string} id - primary key value for this object.
     * @returns {string}
     */
    locate(id = '') {
        return path.join(this.opts.basedir, `${id}.json`);
    }

    /**
     * Create the record in the storage engine
     *
     * @param {object} obj - object to store.
     * @returns {string} id of this object
     */
    async create(obj) {
        const id = CombUUID.encode();
        await fs.writeFile(this.locate(id), JSON.stringify(obj, null, 4), { flag: 'wx' });
        return id;
    }

    /**
     * Read the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @returns {object}
     */
    async read(id) {
        const content = await fs.readFile(this.locate(id));
        const json = content.toString();
        const obj = JSON.parse(json);
        return obj;
    }

    /**
     * Update the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @param {object} obj - object to store.
     */
    async update(id, obj) {
        const orig = await this.read(id);
        Object.assign(orig, obj); // apply changes
        await fs.writeFile(this.locate(id), JSON.stringify(orig, null, 4), { flag: 'w' });
    }

    /**
     * Partial Update of the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     * @param {object} delta - changes to apply.
     */
    async patch(id, delta) {
        // update() can handle partial updates, so just call update()
        await this.update(id, delta);
    }

    /**
     * Delete the record in the storage engine.
     *
     * @param {string|number} id - identifier / primary key.
     */
    async delete(id) {
        await fs.unlink(this.locate(id));
    }

    /**
     * List records in the storage engine.
     *
     * @param {object} filter - selects which records to return.
     * @returns {object[]}
     */
    async list(filter) {
        const jsonfiles = (await fs.readdir(this.opts.basedir)).sort();
        return await Promise.all(jsonfiles.map(async (jsonfile) =>  await this.read(jsonfile.replace(/\.json$/i,''))));
    }

}

module.exports.JSONStorage = JSONStorage;

/**
 * FileRenderHttpReqResDecorator adds res.renderFile(filename)
 *
 * @version 1.0.0
 * @extends HttpReqResDecorator
 */
class FileRenderHttpReqResDecorator extends HttpReqResDecorator {

    /**
     * Creates a new instance of RenderHttpReqResDecorator
     *
     * @constructor
     */
    constructor(obj = {}) {
        super();
        this.viewsdir = typeof obj.viewsdir === 'string' ? obj.viewsdir : path.join(path.sep, 'tmp', 'views');
        this.views = {}
    }

    /**
     * adds res.renderFile(filename)
     *
     * @param {object} req - Http Request Object
     * @param {object} res - Http Response Object
     */
    decorate(req, res) {

        res.locals = res.locals || {}; // template variables

        res.renderFile = async (view) => {
            view = path.basename(view); // sanitize view name

            // check the cache to see if we have a compiled template
            if (!this.views.hasOwnProperty(view)) {
                const filepath = path.join(this.viewsdir, path.basename(view));
                const file = await fs.readFile(filepath);
                this.views[view] = new TCTemplate(file.toString());
            }

            // render the usual way
            const body = this.views[view].render(res.locals);
            res.writeHead(HttpStatusCode.OK, HttpStatusText.OK, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'text/html',
            });
            res.end(body);
        };
    }
}

module.exports.FileRenderHttpReqResDecorator = FileRenderHttpReqResDecorator;

/**
 * StaticFilesRoute serves a directory of static files ;)
 *
 * @version 1.0.0
 */
class StaticFilesRoute extends Route {

    /**
     * Creates a new instance of StaticFilesRoute
     *
     * @constructor
     * @param {object} obj - options such as mountpoint.
     */
    constructor(obj = {}) {
        const mountpoint = typeof obj.mountpoint === 'string' ? obj.mountpoint : '/files';
        super({
            method: ['GET','HEAD'],
            pattern: new RegExp('^' + mountpoint + '(?<filename>.*)$'),
            handler: async (req, res) => {
                const filename = path.basename(path.normalize(req.params.filename));
                const ext = path.extname(filename).slice(1);
                const contentType = MimeTypes[ext] || 'application/bin';

                try {
                    const file = await fs.readFile(path.join(this.filesdir, filename));
                    res.writeHead(HttpStatusCode.OK, HttpStatusText.OK, {
                        'Content-Length': Buffer.byteLength(file),
                        'Content-Type': contentType,
                    });
                    if (req.method.toLowerCase() === 'head') {
                        res.end();
                    } else {
                        res.end(file);
                    }

                } catch (err) {
console.log(err);
    // TODO handler other errors
    // TODO error logging
                    res.writeHead(HttpStatusCode.NOT_FOUND, HttpStatusText.NOT_FOUND, {
                        'Content-Length': Buffer.byteLength(HttpStatusText.NOT_FOUND),
                        'Content-Type': 'text/plain',
                    });
                    res.end(HttpStatusText.NOT_FOUND);
                }
            },
        });
        this.filesdir = typeof obj.filesdir === 'string' ? obj.filesdir : path.join(path.set, 'tmp', 'files');
    }
}

module.exports.StaticFilesRoute = StaticFilesRoute;
