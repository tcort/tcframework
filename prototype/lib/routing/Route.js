'use strict';

class Route {

    constructor(obj = {}) {

        if (typeof obj !== 'object') {
            obj = {};
        }

        this.method = (typeof obj.method === 'string' || Array.isArray(obj.method)) ? obj.method : ['GET','HEAD'];
        if (!Array.isArray(this.method)) {
            this.method = [this.method];
        }
        this.pattern = obj.pattern || /^.*$/;

        this.handler = obj.handler || (async (req, res) => {});
        if (typeof this.handler !== 'function') {
            this.handler = (async (req, res) => {});
        }

    }

    match(method = 'GET', remoteUrl = '/') {

        // match method?
        if (!this.method.includes(method)) {
            return false;
        }

        // match pattern?
        if (this.pattern instanceof RegExp) {
            return this.pattern.test(remoteUrl);
        } else if (typeof this.pattern === 'string') {
            return this.pattern === remoteUrl;
        }

        return false;
    }
}

module.exports = Route;
