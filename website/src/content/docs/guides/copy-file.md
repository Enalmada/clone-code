---
title: toFile
description: How to create new files
---

`toFile` copies contents of a file to a new location with the defined replacements made.

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