---
title: Add Type
description: Add types to const
---

`addType` adds to a union.

```ts
/* TYPE_HOOK
{
  "addType": "<%= h.changeCase.pascalCase(name) %>"
}
*/
export type SubjectType = 'User' | 'Task' | 'all';

```