'use strict';

// RFC6901 JavaScript Object Notation (JSON) Pointer
function jsonpointer(obj, ptr) {

    if (typeof obj !== 'object' || obj == null) {
        throw new Error('jsonpointer(obj, ptr): obj must be a non-null object');
    }

    if (typeof ptr !== 'string') {
        throw new Error('jsonpointer(obj, ptr): ptr must be a string');
    }

    if (ptr === '') {
        return obj;
    }

    if (ptr[0] !== '/') {
        throw new Error('jsonpointer(obj, ptr): non-empty ptr must begin with a "/"');
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

module.exports = jsonpointer;
