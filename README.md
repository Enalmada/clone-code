# clone-code

A means of turning repeatable patterns in your source code into template through comments. 

All existing solutions (that I could find with reasonable search time)
require you to copy your code into separate files. 
It just isn't practical to keep these templates in sync with rapidly evolving codebase.  Every refactor is double the work. 
Editors don't handle these file types well.

## Supports
* copying file to another file
* copy block of code
* add new union type
  ex:  "const entities = 'two' | 'one';" -> "const entities = 'three' | 'two' | 'one';"
* add TODO comments (for things that just can't be templated but shouldn't be forgotten)

For example, this source:
```ts
/* ENTITY_HOOK
{
  "toFile": "test/outputs/<%= h.changeCase.lower(name) %>.ts",
  "replacements": [
    { "find": "Source", "replace": "<%= h.inflection.camelize(name) %>" }
  ]
}
*/

export class Source {}
```

Turns into
```ts
export class NewEntity {}
```

## Getting Started
Read the documentation [website](https://clone-code.vercel.app/)

See [nextjs-boilerplate](https://github.com/Enalmada/nextjs-boilerplate) for full usage example.

## TODO
- [ ] validating comment hook data
- [ ] not changing data within hooks

## inspiration
* [hygen](https://www.hygen.io/)
* [plop](https://plopjs.com/)

## Contribute
Using [changesets](https://github.com/changesets/changesets) so please remember to run "changeset" with any PR that might be interesting to people on an older template.
Although this isn't being deployed as a module, I would like to call out things worth keeping in sync.