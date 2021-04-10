'use strict';

const {
    Controller,
    Validator,
} = require('../../../');

class ToDoController extends Controller  {
    constructor(storage, logger) {
        super(
            Validator.object({
                task: Validator.string().min(1).max(255),
                done: Validator.boolean(),
            }),
            storage,
            logger
        );
    }
}

module.exports = ToDoController;
