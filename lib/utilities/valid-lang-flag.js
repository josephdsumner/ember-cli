/* 
[WIP] 

Processes the input provided for experimental --lang flag feature
of ember-cli's `new` and `init` commands.

*/

'use strict';

const getLangCodeInfo = require('is-language-code');

const MSG_HEADER = `An error with the \`--lang\` flag returned the following message:`;

const MSG_FOOTER = `Information about using the \`--lang\` flag:
  The \`--lang\` flag sets the base human language of the app in index.html
  If used, the lang option must specfify a valid language code.
  For default behavior, remove the flag.
  See \`ember <command> help\` for more information.`;

// Handles misuse case: trying to set app programming language
// -----------------------------------------------------------
// There are edge cases (marked) where the value is both a commonly-used
// abbreviation for a programming language AND a valid ISO-639 language code.

// The current behavior for these is to assume that the intent was to set
// the application programming language. That is, the programming language
// result overrides the human language one.

// This decision is based on the current list of edge cases, which includes
// historical and sign languages.

// This list should be unit tested in its entirety.
// Before committing changes to this list, check for new edge cases by
// enabling `expect(getLangArgResult(langArg).isValidLangCode).to.be.false;`
// Disable to confirm the override.
const PROG_LANGS = [
  'javascript',
  '.js',
  'js',
  'emcascript2015',
  'emcascript6',
  'es6',
  'emcascript2016',
  'emcascript7',
  'es7',
  'emcascript2017',
  'emcascript8',
  'es8',
  'emcascript2018',
  'emcascript9',
  'es9',
  'emcascript2019',
  'emcascript10',
  'es10',

  'typescript',
  '.ts',
  // Edge case: `ts` is a valid lang code for `Tsonga`
  'ts',

  'node.js',
  'node',
  'handlebars',
  '.hbs',
  'hbs',
  'glimmer',
  'glimmer.js',
  'glimmer-vm',

  'markdown',
  'markup',
  'html5',
  'html4',
  '.md',
  '.html',
  '.htm',
  '.xhtml',
  '.xml',
  '.xht',
  'md',
  'html',
  'htm',
  'xhtml',
  // Edge case: `xml` is a valid code for `Malaysian Sign Language`
  'xml',
  // Edge case: `xht` is a valid code for `Hattic`
  'xht',

  '.sass',
  '.scss',
  '.css',
  'sass',
  'scss',
  // Edge case: `css` is a valid code for `Costanoan`
  'css',
];

function isProgLang(langArg) {
  return langArg && PROG_LANGS.includes(langArg.toLowerCase().trim());
}

function getProgLangMsg(langArg) {
  let message = `Trying to set the app programming language to \`${langArg}?\`
  This is not the intended usage of the \`--lang\` flag.`;
  return message;
}

// Handles misuse case: the lang flag is used without specification,
// e.g. `ember new foo --lang --skip-npm`
// Otherwise, the next option in the command gets parsed as the langArg.
// It gets rejected as a valid language code, but the option doesn't get
// executed as intended.
function isCliOption(langArg) {
  return langArg && langArg[0] === '-';
}

function getCliMsg(langArg) {
  let message = `Detected lang specification starting with command flag \`-\`.
  Is \`${langArg}\` meant to be an ember-cli command option?
  This issue is likely caused by using the \`--lang\` flag without a specification.`;
  return message;
}

function isValidLangCode(langArg) {
  return getLangCodeInfo(langArg).res;
}

function getLangCodeMsg(langArg) {
  return getLangCodeInfo(langArg).message;
}

function getMainMsg(langArg) {
  if (isProgLang(langArg)) {
    return getProgLangMsg(langArg);
  }
  if (isCliOption(langArg)) {
    return getCliMsg(langArg);
  } else {
    return getLangCodeMsg(langArg);
  }
}

function getResult(langArg) {
  if (isProgLang(langArg) || isCliOption(langArg)) {
    return false;
  } else {
    return isValidLangCode(langArg) ? langArg : isValidLangCode(langArg);
  }
}

function getWrappedMsg(langArg) {
  let wrappedMsg;
  if (getMainMsg(langArg)) {
    wrappedMsg = `${MSG_HEADER}
  ${getMainMsg(langArg)}\n${MSG_FOOTER}`;
  } else {
    wrappedMsg = getMainMsg(langArg);
  }
  return wrappedMsg;
}

module.exports = function getLangArgResult(langArg) {
  return {
    langArgValue: langArg,
    isValidLangCode: isValidLangCode(langArg),
    message: getWrappedMsg(langArg),
    result: getResult(langArg),
  };
};
