'use strict';

const fs = require('fs').promises;
const path = require('path');

const Storage = require('./Storage');

class JSONStorage extends Storage {

    constructor(opts = {}) {
        super(opts);

        this.opts.pk = typeof opts.pk === 'string' ? opts.pk : 'id';
        this.opts.basedir = path.join(path.sep, 'tmp');
    }

    locate(id = '') {
        return path.join(this.opts.basedir, `${id}.json`);
    }

    async create(obj) {
        await fs.writeFile(this.locate(obj[this.opts.pk]), JSON.stringify(obj, null, 4), { flag: 'wx' });
    }

    async read(id) {
        const content = await fs.readFile(this.locate(id));
        const json = content.toString();
        const obj = JSON.parse(json);
        return obj;
    }

    async update(id, obj) {
        const orig = await this.read(id);
        Object.assign(orig, obj); // apply changes
        await fs.writeFile(this.locate(obj[this.opts.pk]), JSON.stringify(obj, null, 4), { flag: 'w' });
    }

    async delete(id) {
        await fs.unlink(this.locate(id));
    }

}

module.exports = JSONStorage;
