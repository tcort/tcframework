'use strict';

const {
    HttpStatusCodes,
    Route,
} = require('../../..');
const { StatusCode, StatusText } = HttpStatusCodes;

class IndexRoute extends Route {
    constructor(obj = {}) {
        super({
            method: 'GET',
            pattern: '^/$',
            handler: async (req, res) => {
                await res.renderFile('index.tct');
            },
        });

    }
}

module.exports = IndexRoute;
