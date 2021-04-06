'use strict';

const Logger = require('./Logger');

class ConsoleLogger extends Logger {
    constructor() {
        super();
    }

    inTestEnv(...args) {
        console.log(`[${new Date().toISOString()}][DEBUG] ${args.join(' ')}`);
    }

    inProdEnv(...args) {
        console.log(`[${new Date().toISOString()}][INFO] ${args.join(' ')}`);
    }

    toInvestigateTomorrow(...args) {
        console.log(`[${new Date().toISOString()}][WARN] ${args.join(' ')}`);
    }

    wakeMeInTheMiddleOfTheNight(...args) {
        console.log(`[${new Date().toISOString()}][ERROR] ${args.join(' ')}`);
    }
}

module.exports = ConsoleLogger;
