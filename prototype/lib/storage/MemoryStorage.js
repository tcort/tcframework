'use strict';

const fs = require('fs').promises;
const path = require('path');

const CombUUID = require('../utils/CombUUID');
const Storage = require('./Storage');

class MemoryStorage extends Storage {

    constructor(opts = {}) {
        super(opts);

        this.opts.pk = typeof opts.pk === 'string' ? opts.pk : 'id';
        this.opts.basedir = typeof opts.basedir === 'string' ? opts.basedir : path.join(path.sep, 'tmp');

        this.memory = {};
    }

    async create(obj) {
        const id = CombUUID.encode();
        this.memory[id] = JSON.parse(JSON.stringify(obj));
        return id;
    }

    async read(id) {
        return this.memory[id];
    }

    async update(id, obj) {
        Object.assign(this.memory[id], obj); // apply changes
    }

    async delete(id) {
        delete this.memory[id];
    }

}

module.exports = MemoryStorage;
