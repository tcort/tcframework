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

The TCTemplate Engine implements a pure functional templating language.
For a given set of inputs (template text and variables), the engine
always produces the same results.

Similar to many templating engines, TCTemplate uses tags along with an object
called `locals` to customize the output. Tags begin with `[` and end with `]`.
Variables from locals are referenced with JSON Pointers (RFC6901).

Tag summary:

- `[=/JSONPointer/path/to/variable]` - outputs the value (with HTML entities escaped)
- `[-/JSONPointer/path/to/variable]` - outputs the value (unescaped)

### Composing documents with `[` and `]` characters

`[` and `]` are special characters in this template language. To escape `[`
and `]` (e.g. if the text of the template contains `[` and `]`
that are not part of tags), simply use the HTML entity codes `&#91;` and `&#93;`
respectively.

- `[` becomes `&#91;`
- `]` becomes `&#93;`

### Variables

Variables can be inserted into the output with either the `-` (unescaped) or
`=` (escaped) tag containing a JSONPointer into `locals`.

Input:

```
[-/math/expr]
[=/math/expr]
```

locals:

```
{
    "math": {
        "expr": "2 < 4"
    }
}
```

Output:

```
2 < 4
2 &#60; 4
```

### Conditionals

Blocks can be conditionally inserted into the output with the `if` tag.
To have the content rendered in the output, supply a JSON Pointer that
points to a variable in locals which is `true`.

Input:

```
[if /user/returning]
Welcome Back!
[/if]

[if /user/verified]
Your account is verified
[/if]
```

locals:

```
{
    "user": {
        "returning": true,
        "verified": false
    }
}
```

Output:

```
Welcome Back!
```

### Iteration

Blocks can be repeated for each element of an array with the `for` tag.
The `for` tag takes a JSON Pointer which denotes where the current element
will be stored and a JSON Pointer which denotes the path to the array.

Input:

```
[for /day in /daysofweek] [=/day] [/for]
```

locals:

```
{
    daysofweek: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]
}
```

Output:

```
 Sunday  Monday  Tuesday  Wednesday  Thursday  Friday  Saturday 
```


### Comments

The comment tag suppresses the enclosed text from being output.

Input:

```
foo[comment]this is a comment and the contents are not output[/comment]bar
```

Output:

```
foobar
```
