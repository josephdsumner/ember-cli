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


// Handles misuse case: trying to set app programming language
const PROG_LANGS = [
  'typescript',
  'javascript',
  'html',
  'css',
  'glimmer',
  'emcas',
  'es6',
  'node',
  'handlebars'
];

function isProgLang(langArg) {
  return PROG_LANGS.includes(langArg.toLowerCase().trim());
}

function getProgLangMsg(langArg)  {
  let message = `Trying to set the app programming language to\`${langArg}?\` The \`--language\` flag sets the base human language of the app in index.html`;
  return message;
}

// Handles misuse case: the language flag is used without specification,
// e.g. `ember new foo --language --skip-npm`
// Currently, the next option in the command gets parsed as the langArg.
// It gets rejected as a valid language code, but the option doesn't get
// executed as intended
function isCliOption(langArg) {
  return langArg[0] === '-'
}

function getCliMsg(langArg) {
  let message = `Detected a language specification starting with \`-\` -- is \`${langArg}\` meant to be a ember-cli command option? This issue is likely caused by using the \`--language\` flag without a specification. If used, the language option must specfify a valid language code. For default language behavior, remove the flag.`;
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
  }
  if (isCliOption(langArg)) {
    return getCliMsg(langArg);
  }
  else {
    return getLangCodeMsg(langArg);
  }
}

function getResult(langArg) {
  let result = isValidLangCode(langArg)
    ? langArg
    : isValidLangCode(langArg);
  return result;
  }

module.exports = function getLangArgResult(langArg) {
  return {
    langArgValue: langArg,
    isValidLangCode: isValidLangCode(langArg),
    message: getMsg(langArg),
    result: getResult(langArg)
  };
}
