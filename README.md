# tcframework

TC's JavaScript framework.

## Current Status

This project is under construction. No formal release has been made (yet!).

## Lay of the Land

A `Validator` defines a schema for a data model. For example:

```
const schema = Validator.object({
    firstname: Validator.string().min(1).max(64),
    lastname: Validator.string().min(1).max(64),
});
```

A `Storage` engine provides the implementation that actually stores and
retrieves data. It implements the standard Create/Read/Update/Delete operations
as well as list and patch.

```
class Storage {
    async create(obj)
    async read(id)
    async update(id, obj)
    async patch(id, delta)
    async delete(id)
    async list(filter) 
}
```

A `Controller` combines the schema with a dependency injected storage engine
and logger.

```
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
```

A `Logger` provides several functions for logging purposes.

```
const logger = new ConsoleLogger();

// 4 levels of priority. each accept arguments which are formatted into log messages
logger.inTestEnv('debug messages useful only in test environment');
logger.inProdEnv('informational messages useful in production environment');
logger.toInvestigateTomorrow('warning messages');
logger.wakeMeInTheMiddleOfTheNight('error messages');
```

A `TestSuite` is a named array of `TestCase`s. A `TestCase` performs some sort
of test. A test passes if the function passed to the `TestCase` does not throw
an error.  A test fails if the function passed to the `TestCase` throws an
error. A helpful assertion function `expect()` provides some helpers which
simplify test writing.

```
new TestSuite('LengthCheck', [

    new TestCase('checks that expected length matches input', () => {
        [
            { length: 0, value: '' },
            { length: 0, value: [] },
            { length: 1, value: 'x' },
            { length: 1, value: ['x'] },
            { length: 3, value: 'foo' },
            { length: 3, value: [1,2,3] },
        ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).notToThrow());
    }),
    new TestCase('throws error when expected length does not match input', () => {
        [
            { length: 0, value: 'apple' },
            { length: 1, value: 'apple' },
            { length: 1, value: '' },
            { length: 3, value: 'apple' },
        ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).toThrow('CheckError'));
    }),

]).execute();
```

## TCTemplate Engine

### Comments

The comment tag suppresses the enclosed text from being output.

Input:

```
foo[comment]this is a comment and the contents are not output[/comment]bar
```

Outputs:

```
foobar
```