---
title: Getting Started
description: A guide how to use this repository.
---

## Installation
`bun install @enalmada/clone-code`

## Usage
Add comment to the top of your file starting with your "hook" name.
Using json, add a "to" and an array of replacements.
```ts
/* ENTITY_HOOK
{
  "to": "test/outputs/<%= h.changeCase.lower(name) %>.ts",
  "replacements": [
    { "find": "Source", "replace": "<%= h.inflection.camelize(name) %>" }
  ]
}
*/

export class Source {}
```

Then call
`bunx clone-code ENTITY_HOOK NewEntity ./src`


## Functions

The following libraries have been added to the context under "h".  Refer to them for any functions you would like to use:
* [inflection](https://www.npmjs.com/package/inflection) A package to transform english strings into other forms like the plural form, singular form, camelCase form, etc.
* [change-case](https://www.npmjs.com/package/change-case) Transform a string between camelCase, PascalCase, Capital Case, snake_case, kebab-case, CONSTANT_CASE and others.