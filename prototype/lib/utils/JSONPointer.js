'use strict';

// RFC6901 JavaScript Object Notation (JSON) Pointer
class JSONPointer {

    static set(obj, ptr, value) {

        if (typeof obj !== 'object' || obj == null) {
            throw new JSONPointerError(obj, ptr, 'obj must be a non-null object');
        }

        if (typeof ptr !== 'string') {
            throw new JSONPointerError(obj, ptr, 'ptr must be a string');
        }

        if (ptr === '') {
            return value;
        }

        if (ptr[0] !== '/') {
            throw new JSONPointerError(obj, ptr, 'non-empty ptr must begin with a "/"');
        }

        const components = ptr
                                .split('/')                                         // break up /foo/bar into ['foo','bar']
                                .map((component) => component.replace(/~1/g, '/'))  // '~1' to '/'
                                .map((component) => component.replace(/~0/g, '~'))  // '~0' to '~'
                                .slice(1);                                          // chop off array head (which will be '')

        let cur = obj;
        components.slice(0, -1).forEach((component) => {
            if (!['object','array'].includes(typeof cur[component]) || cur[component] === null) {
                cur[component] = {};
            }
            cur = cur[component];
        });
        cur[components[components.length - 1]] = value;

        return obj;
    }

    static get(obj, ptr) {

        if (typeof obj !== 'object' || obj == null) {
            throw new JSONPointerError(obj, ptr, 'obj must be a non-null object');
        }

        if (typeof ptr !== 'string') {
            throw new JSONPointerError(obj, ptr, 'ptr must be a string');
        }

        if (ptr === '') {
            return obj;
        }

        if (ptr[0] !== '/') {
            throw new JSONPointerError(obj, ptr, 'non-empty ptr must begin with a "/"');
        }

        const components = ptr
                                .split('/')                                         // break up /foo/bar into ['foo','bar']
                                .map((component) => component.replace(/~1/g, '/'))  // '~1' to '/'
                                .map((component) => component.replace(/~0/g, '~'))  // '~0' to '~'
                                .slice(1);                                          // chop off array head (which will be '')

        return components.reduce((result, component) => {
            if (typeof result !== 'object' || result == null) {
                return undefined; // path not found
            }
            return result[component];
        }, obj);
    }

}
module.exports = JSONPointer;
