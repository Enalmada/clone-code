/* ENTITY_HOOK
{
  "to": "test/outputs/<%= h.changeCase.lower(name) %>.ts",
  "replacements": [
    { "find": "Source", "replace": "<%= h.inflection.camelize(name) %>" }
  ]
}
*/

export class Source {}
