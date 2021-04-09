'use strict';

const fs = require('fs').promises;
const path = require('path');

const CombUUID = require('../utils/CombUUID');
const Storage = require('./Storage');

class JSONStorage extends Storage {

    constructor(opts = {}) {
        super(opts);

        this.opts.pk = typeof opts.pk === 'string' ? opts.pk : 'id';
        this.opts.basedir = typeof opts.basedir === 'string' ? opts.basedir : path.join(path.sep, 'tmp');
    }

    locate(id = '') {
        return path.join(this.opts.basedir, `${id}.json`);
    }

    async create(obj) {
        const id = CombUUID.encode();
        await fs.writeFile(this.locate(id), JSON.stringify(obj, null, 4), { flag: 'wx' });
        return id;
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
        await fs.writeFile(this.locate(id), JSON.stringify(orig, null, 4), { flag: 'w' });
    }

    async delete(id) {
        await fs.unlink(this.locate(id));
    }

    async list(filter) {
        const jsonfiles = (await fs.readdir(this.opts.basedir)).sort();
        return await Promise.all(jsonfiles.map(async (jsonfile) =>  await this.read(jsonfile.replace(/\.json$/i,''))));
    }

}

module.exports = JSONStorage;
