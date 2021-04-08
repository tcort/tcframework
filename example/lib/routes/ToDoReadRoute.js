'use strict';

const {
    Route,
    HttpStatusCodes,
} = require('../../..');
const { StatusCode, StatusText } = HttpStatusCodes;

class ToDoReadRoute extends Route {
    constructor(obj = {}) {
        super({
            method: 'GET',
            pattern: '^/todos/(?<id>[A-Za-z0-9-]+)$',
            handler: async (req, res) => {
                try {
                    const obj = await req.controllers.todo.read(req.params.id);
                    res.json(obj);
                } catch (err) {
    // TODO handler other errors
                    res.writeHead(StatusCode.NOT_FOUND, StatusText.NOT_FOUND, {
                        'Content-Length': Buffer.byteLength(StatusText.NOT_FOUND),
                        'Content-Type': 'text/plain',
                    });
                    res.end(StatusText.NOT_FOUND);
                }
            },
        });
    }
}

module.exports = ToDoReadRoute;;
