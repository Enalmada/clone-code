---
title: Context Functions
description: How to manipulate casing
---

The following libraries have been added to the context under "h".  

Refer to them for any functions you would like to use:
* [inflection](https://www.npmjs.com/package/inflection) A package to transform english strings into other forms like the plural form, singular form, camelCase form, etc.
* [change-case](https://www.npmjs.com/package/change-case) Transform a string between camelCase, PascalCase, Capital Case, snake_case, kebab-case, CONSTANT_CASE and others.

You use them like:
`<%= h.changeCase.pascalCase(name) %>`
`<%= h.inflection.pluralize(name) %>`

Here is a quick summary for reference which may not be current:

## Inflection

inflection.pluralize( str, plural );
inflection.singularize( str, singular );
inflection.inflect( str, count, singular, plural );
inflection.camelize( str, low_first_letter );
inflection.underscore( str, all_upper_case );
inflection.humanize( str, low_first_letter );
inflection.capitalize( str );
inflection.dasherize( str );
inflection.titleize( str );
inflection.demodulize( str );
inflection.tableize( str );
inflection.classify( str );
inflection.foreign_key( str, drop_id_ubar );
inflection.ordinalize( str );
inflection.transform( str, arr );

## change-case

| Method            | Result      |
| ----------------- | ----------- |
| `camelCase`       | `twoWords`  |
| `capitalCase`     | `Two Words` |
| `constantCase`    | `TWO_WORDS` |
| `dotCase`         | `two.words` |
| `kebabCase`       | `two-words` |
| `noCase`          | `two words` |
| `pascalCase`      | `TwoWords`  |
| `pascalSnakeCase` | `Two_Words` |
| `pathCase`        | `two/words` |
| `sentenceCase`    | `Two words` |
| `snakeCase`       | `two_words` |
| `trainCase`       | `Two-Words` |