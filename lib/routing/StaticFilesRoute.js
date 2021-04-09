'use strict';

const { StatusCode, StatusText } = require('../refdata/HttpStatusCodes');
const MimeTypes = require('../refdata/MimeTypes');
const Route = require('./Route');
const fs = require('fs').promises;
const path = require('path');

class StaticFilesRoute extends Route {

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
                    res.writeHead(StatusCode.OK, StatusText.OK, {
                        'Content-Length': Buffer.byteLength(file),
                        'Content-Type': contentType,
                    });
                    if (req.method.toLowerCase === 'head') {
                        res.end();
                    } else {
                        res.end(file);
                    }

                } catch (err) {
    // TODO handler other errors
    // TODO error logging
                    res.writeHead(StatusCode.NOT_FOUND, StatusText.NOT_FOUND, {
                        'Content-Length': Buffer.byteLength(StatusText.NOT_FOUND),
                        'Content-Type': 'text/plain',
                    });
                    res.end(StatusText.NOT_FOUND);
                }
            },
        });
        this.filesdir = typeof obj.filesdir === 'string' ? obj.filesdir : path.join(path.set, 'tmp', 'files');
    }
}

module.exports = StaticFilesRoute;
