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
