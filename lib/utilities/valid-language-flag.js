/** 
[WIP] 

Processes the input provided for experimental --language flag feature
of ember-cli's `new` and `init` commands.

Simple first implementation: 
- check a language code via `is-language-code` package dependency
- requires that components of the input must be valid
- returns type boolean

*/

'use strict';

const isLangCode = require("is-language-code");

module.exports = function isValidLanguageFlag(languageFlag) {
  return isLangCode(languageFlag).res;
}