---
title: Copy Block
description: Copy Block of code
---

`toPlacement` adds a block of code relative to the hook comment.

supports `above | below | bottom`

```ts
/* clone-code INFILE_HOOK
{
  "toPlacement": "bottom",
  "replacements": [
    { "find": "Task", "replace": "<%= h.changeCase.pascalCase(name) %>" },
    { "find": "task", "replace": "<%= h.changeCase.camelCase(name) %>" },
    { "find": "TASK", "replace": "<%= h.changeCase.constantCase(name) %>" }
  ]
}
*/

// TASK

export const taskExample = 'Task example';

/* clone-code INFILE_HOOK end */
```