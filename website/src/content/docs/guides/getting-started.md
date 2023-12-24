---
title: Getting Started
description: A guide how to use this repository.
---

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

## Installation
`bun install -D @enalmada/clone-code`

## Usage
Add comment to your file starting with your "hook" name.
Using json, add some transforms.  For example:

`bunx clone-code <hook> <new entity> <source dir>`


```ts
/* clone-code ENTITY_HOOK
{
  "toFile": "test/outputs/<%= h.changeCase.lower(name) %>.ts",
  "replacements": [
    { "find": "Source", "replace": "<%= h.inflection.camelize(name) %>" }
  ]
}
*/

export class Source {}
```

Then call
`bunx clone-code ENTITY_HOOK NewEntity ./src`

You will end up with another file with your changes.

