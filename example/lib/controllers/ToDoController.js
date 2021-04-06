'use strict';

const {
    Controller,
    Validator,
} = require('../../../');

class ToDoController extends Controller  {
    constructor(storage) {
        super(
            // schema
            Validator.object({
                task: Validator.string().min(1).max(255),
                done: Validator.boolean(),
            }),
            // i/o
            storage
        );
    }
}

module.exports = ToDoController;
