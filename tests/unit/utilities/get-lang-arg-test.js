'use strict';

const getLangArg = require('../../../lib/utilities/get-lang-arg');
const expect = require('chai').expect;

describe('lib/utilities/get-lang-arg', function () {
  describe('Valid language codes', function () {
    ['en', 'en-gb', 'en-GB', 'EN', 'EN-gb', 'EN-GB'].forEach((langArg) => {
      it(`'${langArg}' is a valid language code`, function () {
        expect(() => {
          getLangArg(langArg);
        }).not.to.throw();
        expect(getLangArg(langArg)).to.equal(langArg);
      });
    });
  });

  describe('Edge Cases: valid language codes + programming languages', function () {
    [
      'ts', // Tsonga
      'TS', // Tsonga (case insensitivity check)
      'xml', // Malaysian Sign Language
      'xht', // Hattic
      'css', // Costanoan
    ].forEach((langArg) => {
      it(`'${langArg}' is a valid language code and programming language`, function () {
        expect(() => {
          getLangArg(langArg);
        }).not.to.throw();
        expect(getLangArg(langArg)).to.equal(langArg);
      });
    });
  });

  describe('Invalid lang Flags: Misc.', function () {
    ['', '..-..', '12-34', ' en', 'en ', 'en-uk', 'en-UK', 'EN-uk', 'EN-UK', 'en-cockney'].forEach((langArg) => {
      it(`'${langArg}' is an invalid language argument; not related misuse cases`, function () {
        expect(() => {
          getLangArg(langArg);
        }).not.to.throw();
        expect(getLangArg(langArg)).to.equal(undefined);
      });
    });
  });

  describe('Invalid Language Flags, Misuse case: Programming Languages', function () {
    [
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
      '.sass',
      '.scss',
      '.css',
      'sass',
      'scss',

      // + case-insensitivity
      'JavaScript',
      'JAVASCRIPT',
      'JS',
      '.JS',
      'EMCAScript2015',
      'EMCAScript6',
      'ES6',
      'TypeScript',
      'TYPESCRIPT',
      '.TS',
    ].forEach((langArg) => {
      it(`'${langArg}' is an invalid lang argument; possibly an attempt to set app programming language`, function () {
        expect(() => {
          getLangArg(langArg);
        }).not.to.throw();
        expect(getLangArg(langArg)).to.equal(undefined);
      });
    });
  });

  describe('Invalid Language Flags, Misuse case: ember-cli `new` and `init` options / aliases', function () {
    [
      '--disable-analytics',
      '--watcher=node',
      '--dry-run',
      '-d',
      '--verbose',
      '-v',
      '--blueprint',
      '-b',
      '--skip-npm',
      '-sn',
      '--skip-bower',
      '-sb',
      '--welcome',
      '--no-welcome',
      '--yarn',
      '--name',
      '--skip-git',
      '-sg',
      '--directory',
      '-dir',
    ].forEach((langArg) => {
      it(`'${langArg}' is an invalid language argument; possibly an absorbed ember-cli command option`, function () {
        expect(() => {
          getLangArg(langArg);
        }).not.to.throw();
        expect(getLangArg(langArg)).to.equal(undefined);
      });
    });
  });
});
