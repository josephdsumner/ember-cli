/* 
Processes the input provided for experimental --lang flag feature
of ember-cli's `new` and `init` commands.

*/

'use strict';

const getLangCodeInfo = require('is-language-code');
const SilentError = require('silent-error');


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

// Handles misuse case: the lang flag is used without specification,
// e.g. `ember new foo --lang --skip-npm`
// Otherwise, the next option in the command gets parsed as the langArg.
// It gets rejected as a valid language code, but the option doesn't get
// executed as intended.
function isCliOption(langArg) {
  return langArg && langArg[0] === '-';
}

function isValidLangCodeAndProgLang(langArg) {
  return isValidLangCode(langArg) && isProgLang(langArg);
}

// 1. Template message header for all `--lang`-related throws / warnings
const MSG_HEADER = `An error with the \`--lang\` flag returned the following message:`;

// 2. Body Messages: Issue-specific messages with context information
function getValidAndProgMsg(langArg) {
  let message = `The \`--lang\` flag has been used with argument \`${langArg}\`,
  which is BOTH a valid language code AND an abbreviation for a programming language.`;
  return message;
}

function getLangCodeMsg(langArg) {
  return getLangCodeInfo(langArg).message;
}

function getCliMsg() {
  let message = `Detected a \`--lang\` specification starting with command flag \`-\`.
  This issue is likely caused by using the \`--lang\` flag without a specification.`;
  return message;
}

function getProgLangMsg(langArg) {
  let message = `Trying to set the app programming language to \`${langArg}?\`
  This is not the intended usage of the \`--lang\` flag.`;
  return message;
}

// 3. Outcome messages: report the decision made about setting `lang` in `index.html`
function getLangSetMsg(langArg) {
  let message = `The human language of this application will be set to \`${langArg}\` in 
  the \`<html>\` element's \`lang\` attribute in \`app/index.html\`.`;
  return message;
}

function getLangNotSetMsg(langArg) {
  let message = `The human language of this application will NOT be set to \`${langArg}\` in 
  the \`<html>\` element's \`lang\` attribute in \`app/index.html\`.`;
  return message;
}

// Template Footer
// 4. Guidance for manually resolving unintended errors
// 5. For more information / how to get help
const MSG_FOOTER = `If this was not your intention, you may edit the \`<html>\` element's 
  \`lang\` attribute in \`app/index.html\`. directly.
Information about using the \`--lang\` flag:
  The \`--lang\` flag sets the base human language of the app in index.html
  If used, the lang option must specfify a valid language code.
  For default behavior, remove the flag.
  See \`ember <command> help\` for more information.`;

function getBodyMsg(langArg) {
  if (isValidLangCodeAndProgLang(langArg)) {
    return `${getValidAndProgMsg(langArg)}
${getLangSetMsg(langArg)}`;
  }
  if (isProgLang(langArg)) {
    return `${getProgLangMsg(langArg)}
${getLangNotSetMsg(langArg)}`;
  }
  if (isCliOption(langArg)) {
    return `${getCliMsg(langArg)}
${getLangNotSetMsg(langArg)}`;
  } else if (!isValidLangCode(langArg)) {
    return `${getLangCodeMsg(langArg)}
${getLangNotSetMsg(langArg)}`;
  } else {
    return `${getLangCodeMsg(langArg)}`;
  }
}

function getWrappedMsg(langArg) {
  let wrappedMsg;
  if (getBodyMsg(langArg)) {
    wrappedMsg = `${MSG_HEADER}
  ${getBodyMsg(langArg)}
${MSG_FOOTER}`;
  } else {
    wrappedMsg = getBodyMsg(langArg);
  }
  return wrappedMsg;
}

function isValidLangCode(langArg) {
  return getLangCodeInfo(langArg).res;
}

function getResult(langArg) {
  return isValidLangCode(langArg) ? langArg : undefined;
}

function getRawLangInfo(langArg) {
  return {
    langArgValue: langArg,
    isValidLangCode: isValidLangCode(langArg),
    message: getWrappedMsg(langArg),
    result: getResult(langArg),
  };
}

module.exports = function getLangArgResult(langArg) {
  let rawLangInfo = getRawLangInfo(langArg);
  if (!rawLangInfo.result) {
    throw new SilentError(rawLangInfo.message);
  }
  return rawLangInfo;
};
