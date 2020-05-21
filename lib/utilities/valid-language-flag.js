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

const getLangCodeInfo = require("is-language-code");


const PROG_LANGS = [
  'typescript',
  'javascript',
  'html',
  'css',
  'glimmer',
  'emcas',
  'node',
  'handlebars'
];

function isProgLang(langArg) {
  return PROG_LANGS.includes(langArg.toLowerCase().trim());
}

function getProgLangMsg(langArg)  {
  let message = `Trying to set the app programming language to ${languageArg}? The \`--language\` flag sets the base human language of the app in index.html`;
  return message;
}

function isValidLangCode(langArg) {
  return getLangCodeInfo(langArg).res;
}

function getLangCodeMsg(langArg)  {
  return getLangCodeInfo(langArg).message;
}


function getMsg(langArg)  {
  if (isProgLang(langArg))  {
    return getProgLangMsg(langArg);
  } else {
    return getLangCodeMsg(langArg);
  }
}

module.exports = function getLangArgResult(langArg) {
  return {
    langArgValue: langArg,
    isValidLangCode: isValidLangCode(langArg),
    message: getMsg(langArg)
  };
}
