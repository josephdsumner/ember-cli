/* 
[WIP] 

Processes the input provided for experimental --lang flag feature
of ember-cli's `new` and `init` commands.

*/

'use strict';

const getLangCodeInfo = require("is-language-code");

const MSG_HEADER =
`An error with the \`--lang\` flag returned the following message:`;

const MSG_FOOTER =
`Information about using the \`--lang\` flag:
  The \`--lang\` flag sets the base human language of the app in index.html
  If used, the lang option must specfify a valid language code.
  For default behavior, remove the flag.
  See \`ember <command> help\` for more information.`; 

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
  let message =
  `Trying to set the app programming language to \`${langArg}?\`
  This is not the intended usage of the \`--lang\` flag.`
  return message;
}

// Handles misuse case: the lang flag is used without specification,
// e.g. `ember new foo --lang --skip-npm`
// Otherwise, the next option in the command gets parsed as the langArg.
// It gets rejected as a valid language code, but the option doesn't get
// executed as intended.
function isCliOption(langArg) {
  return langArg[0] === '-'
}

function getCliMsg(langArg) {
  let message =
  `Detected lang specification starting with command flag \`-\`.
  Is \`${langArg}\` meant to be an ember-cli command option?
  This issue is likely caused by using the \`--lang\` flag without a specification.`;
  return message;
}

function isValidLangCode(langArg) {
  return getLangCodeInfo(langArg).res;
}

function getLangCodeMsg(langArg)  {
  return getLangCodeInfo(langArg).message;
}


function getMainMsg(langArg)  {
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

function getWrappedMsg(langArg) {
  let wrappedMsg;
  if (getMainMsg(langArg)) {
    wrappedMsg =
    `${MSG_HEADER}
  ${getMainMsg(langArg)}\n${MSG_FOOTER}`;
  }
  else {
    wrappedMsg = getMainMsg(langArg);
  }
  return wrappedMsg;
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
    message: getWrappedMsg(langArg),
    result: getResult(langArg)
  };
}
