'use strict';

class Controller {

    constructor(schema, storage, logger) {
        this.schema = schema;
        this.storage = storage;
        this.logger = logger;
    }

    async create(obj = {}) {
        this.schema.validate(obj);
        return await this.storage.create(obj);
    }

    async read(id = '') {
        const result = await this.storage.read(id);
        this.schema.validate(result);
        return result;
    }

    async update(id = '', obj = {}) {
        this.schema.validate(obj);
        await this.storage.update(id, obj);
    }

    async patch(id = '', delta = {}) {
        await this.storage.patch(id, delta);
    }

    async delete(id = '') {
        await this.storage.delete(id);
    }

    async list(filter) {
        const results = await this.storage.list(filter);
        results.forEach((result) => this.schema.validate(result));
        return results;
    }
}

module.exports = Controller;
