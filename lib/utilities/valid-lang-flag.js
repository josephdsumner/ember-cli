/* 
Utility for processing the argument passed with the `lang` option 
in ember-cli, i.e. `ember (new||init||addon) app-name --lang=langArg`

Execution Context (usage, input, output, error handling, etc.):
  - called directly by `init` IFF `--lang` flag is used in (new||init||addon)
  - receives single input: the argument passed with `lang` (herein `langArg`)
  - processes `langArg`: lang code validation + error detection / handling
  - DOES emit Warning messages if necessary
  - DOES NOT halt execution process / throw errors / disrupt the build
  - returns single result as output (to `init`):
    - `langArg` (if it is a valid language code)
    - `undefined` (otherwise)
  - `init` assigns the value of `commandOptions.lang` to the returned result
  - downstream, the `lang` attribute is assigned via inline template control:
    - file: `blueprints/app/files/app/index.html`
    - logic: `<html<% if(lang) { %> lang="<%= lang %>"<% } %>>

Internal Mechanics -- the utility processes `langArg` to determine:
  - the value to return to `init` (i.e. validated lang code or undefined)
  - a descriptive category for the usage: `correct`, `incorrect`, `edge`, etc.
  - what message text (if any: category-dependent) to emit before return

Warning Messages (if necessary):
  - An internal instance of `console-ui` is used to emit messages
  - IFF there is a message, it will be emitted before returning the result
  - Components of all emitted messages -- [Name] (writeLevel): 'example':
    - [`HEAD`] (WARNING): 'A warning was generated while processing `--lang`:'
    - [`BODY`] (WARNING): 'Invalid language code, `en-UK`'
    - [`STATUS`] (DEBUG): '`lang` will NOT be set to `en-UK` in `index.html`'
    - [`HELP`]    (INFO): 'Correct usage of `--lang`: ... '

*/

'use strict';

const getLangCodeInfo = require('is-language-code');
const UI = require('console-ui');

const ui = new UI({
  inputStream: process.stdin,
  outputStream: process.stdout,
  errorStream: process.stderr,
  writeLevel: 'WARNING',
  ci: true,
});

/*
Misuse case: attempt to set application programming language via `lang` 
AND
Edge case: valid language code AND a common programming language abbreviation
-------------------------------------------------------------------------------
It is possible that a user might mis-interpret the type of `language` that is 
specified by the `--lang` flag. One notable potential `misuse case` is one in 
which the user thinks `--lang` specifies the application's programming 
language. For example, the user might call `ember new my-app --lang=typescript` 
expecting to achieve an effect similar to the one provided by the 
`ember-cli-typescript` addon.

This misuse case is handled by checking the input `langArg` against an Array 
containing notable programming language-related values: language names 
(e.g. `JavaScript`), abbreviations (e.g. `js`), file extensions (e.g. `.js`), 
or versions (e.g. `ES6`), etc. Specifically, if `langArg` is found within this 
reference list, a WARNING message that describes correct `--lang` usage will 
be emitted. The `lang` attribute will not be assigned in `index.html`, and the 
user will be notified with a corresponding STATUS message.

There are several edge cases (marked) where `langArg` is both a commonly-used
abbreviation for a programming language AND a valid language code. The behavior 
for these cases is to assume the user has used `--lang` correctly and set the 
`lang` attribute to the valid code in `index.html`. To cover for potential 
misuage, several helpful messages will also be emitted:
- `ts` is a valid language code AND a common programming language abbreviation
- the `lang` attribute will be set to `ts` in the application
- if this is not correct, it can be changed in `app/index.html` directly
- (general `help` information about correct `--lang` usage)
*/
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

// 3. `STATUS` message: report if `lang` will be set in `index.html`
function getLangSetMsg(langArg) {
  let message = `The human language of the application will be set to \`${langArg}\` in 
  the \`<html>\` element's \`lang\` attribute in \`app/index.html\`.`;
  return message;
}

function getLangNotSetMsg(langArg) {
  let message = `The human language of the application will NOT be set to \`${langArg}\` in 
  the \`<html>\` element's \`lang\` attribute in \`app/index.html\`.`;
  return message;
}

// Template Footer
// 4. Guidance for manually resolving unintended errors
// 5. For more information / how to get help
const MSG_FOOTER = `If this was not your intention, you may edit the \`<html>\` element's 
  \`lang\` attribute in \`app/index.html\` (for addons: \`tests/dummy/app/index.html\`).
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
    ui.writeWarnLine(rawLangInfo.message);
  }
  return rawLangInfo.result;
};
