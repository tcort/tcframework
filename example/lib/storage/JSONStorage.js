'use strict';

const {
    NotImplementedError,
    Storage,
} = require('../../..');

class JSONStorage extends Storage {

    constructor() {
        super();
    }

    async create(obj) {
        throw new NotImplementedError('Storage.create(obj)');
    }

    async read(id) {
        throw new NotImplementedError('Storage.read(id)');
    }

    async update(id, obj) {
        throw new NotImplementedError('Storage.update(id, obj)');
    }

    async delete(id) {
        throw new NotImplementedError('Storage.delete(id)');
    }

    async list(filter) {
        throw new NotImplementedError('Storage.list(filter)');
    }
}

module.exports = Storage;
