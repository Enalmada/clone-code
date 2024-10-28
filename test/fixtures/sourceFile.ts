/* clone-code ENTITY_HOOK
{
  "toFile": "test/outputs/<%= h.changeCase.camelCase(name) %>.ts",
  "replacements": [
    { "find": "Source", "replace": "<%= h.inflection.camelize(name) %>" }
  ]
}
*/

export class Source {}
