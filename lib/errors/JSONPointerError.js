'use strict';

class JSONPointerError extends Error {

    constructor(obj, ptr, message) {
        super(message);
        this.name = 'JSONPointerError';
        this.obj = obj;
        this.ptr = ptr;
    }

}

module.exports = JSONPointerError;
