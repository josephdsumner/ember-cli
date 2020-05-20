/* 
[WIP] 

Processes the input provided for experimental --language flag feature
of ember-cli's `new` and `init` commands.

Simple implementation: 
- check a language code via `is-language-code` package dependency
- requires that components of the input must be valid
- returns language code if valid, false otherwise

*/

'use strict';

const isValidLangCode = require("is-language-code");

const FLAG_MISUSED_VALUES = [
  'typescript',
  'javascript',
  'html',
  'css',
  'glimmer',
  'emcas',
  'node',
  'handlebars'
];

function isMisusedValue(languageFlag) {
  return FLAG_MISUSED_VALUES.includes(languageFlag.toLowerCase().trim());
}

function getMisuedValueMessage(languageFlag)  {
  let message = `Trying to set the programming language of the app to ${languageFlag}? The \`--language\` flag sets the base human language of the app in index.html`;
  return message;
}




module.exports = function isValidLanguageFlag(languageFlag) {
  if ( isValidLangCode(languageFlag).res ) {
    return languageFlag;
  }
  else {
    return false;
  }
}