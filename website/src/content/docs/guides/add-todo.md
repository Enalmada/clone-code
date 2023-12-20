---
title: Add Todo
description: Add todo to file
---

`todo` is used to add a `\\ TODO` comment above a file that needs work that can't be templated.  
Perhaps something defining access control for an entity that must be reviewed by a human. 

```ts
/* ENTITY_HOOK
{
  "todo": "Add permission tests for <%= name %>"
}
*/

```