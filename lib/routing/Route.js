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
        if (!(this.pattern instanceof RegExp)) {
            this.pattern = new RegExp(this.pattern || /^.*$/);
        }

        this.handler = obj.handler || (async (req, res) => {});
        if (typeof this.handler !== 'function') {
            this.handler = (async (req, res) => {});
        }
    }

    match(method = 'GET', remoteUrl = '/') {
        return (this.method.includes(method) && this.pattern.test(remoteUrl));
    }
}

module.exports = Route;
