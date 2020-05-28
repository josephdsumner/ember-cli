'use-strict';

const getLangArgResult = require('../../../lib/utilities/valid-lang-flag');
const expect = require('chai').expect;

describe('lib/utilities/valid-lang-flag', function () {

  describe('Valid lang Flags', function () {
    [
      'en',
      'en-gb',
      'en-GB',
      'EN',
      'EN-gb',
      'EN-GB',
    ].forEach((langArg) => {
      it(`'${langArg}' is a valid language code; message is null`, function () {
        expect(getLangArgResult(langArg).isValidLangCode).to.be.ok;
        expect(getLangArgResult(langArg).message).to.be.null;
        expect(getLangArgResult(langArg).result).to.equal(langArg);
      });
    });
  });

  describe('Invalid lang Flags: Misc.', function ()  {
    [
      '',
      '..-..',
      '12-34',
      ' en',
      'en ',
      'en-uk',
      'en-UK',
      'EN-uk',
      'EN-UK',
      'en-cockney',
    ].forEach((langArg) => {
      it(`'${langArg}' is an invalid language argument; not related misuse cases`, function () {
        expect(getLangArgResult(langArg).isValidLangCode).to.not.be.ok;
        expect(getLangArgResult(langArg).message).to.be.ok;
        expect(getLangArgResult(langArg).message).to.include('An error with the \`--lang\` flag returned the following message:');
        expect(getLangArgResult(langArg).message).to.include('Information about using the \`--lang\` flag:');
        expect(getLangArgResult(langArg).message).to.not.include('set the app programming language');
        expect(getLangArgResult(langArg).message).to.not.include('ember-cli command option');
        expect(getLangArgResult(langArg).result).to.be.false;
      });
    });
  });

  describe('Invalid Language Flags, Misuse case: Programming Languages', function ()  {
    [
      'javascript', 'js', '.js',
      'emcascript2015', 'emcascript6', 'es6',
      'emcascript2016', 'emcascript7', 'es7',
      'emcascript2017', 'emcascript8', 'es8',
      'emcascript2018', 'emcascript9', 'es9',
      'emcascript2019', 'emcascript10', 'es10',
    
      'typescript', 'ts', '.ts',
    
      'node', 'node.js',
    
      'handlebars', 'hbs', '.hbs',
      'glimmer', 'glimmer.js', 'glimmer-vm',
    
      'markup',
      'markdown', 'md', '.md',
      'html', '.html',
      'htm', '.htm',
      'html5', 'html4',
      'xml', '.xml',
      'xhtml', '.xhtml',
      'xht', '.xht',
    
      'css', '.css', 
      'scss', '.scss', 
      'sass', '.sass',

      // + case-insensitivity
      'JavaScript', 'JAVASCRIPT', 'JS', '.JS',
      'EMCAScript2015', 'EMCAScript6', 'ES6',
      'TypeScript', 'TYPESCRIPT', 'TS', '.TS',

    ].forEach((langArg) => {
      it(`'${langArg}' is an invalid lang argument; possibly an attempt to set app programming language`, function () {
        expect(getLangArgResult(langArg).message).to.be.ok;
        expect(getLangArgResult(langArg).message).to.include('An error with the \`--lang\` flag returned the following message:');
        expect(getLangArgResult(langArg).message).to.include('Information about using the \`--lang\` flag:');
        expect(getLangArgResult(langArg).message).to.include('set the app programming language');
        expect(getLangArgResult(langArg).result).to.be.false;
      });
    });
  });

  describe('Invalid Language Flags, Misuse case: ember-cli `new` and `init` options / aliases', function ()  {
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
      '-dir'
    ].forEach((langArg) => {
      it(`'${langArg}' is an invalid language argument; possibly an absorbed ember-cli command option`, function () {
        expect(getLangArgResult(langArg).isValidLangCode).to.not.be.ok;
        expect(getLangArgResult(langArg).message).to.be.ok;
        expect(getLangArgResult(langArg).message).to.include('An error with the \`--lang\` flag returned the following message:');
        expect(getLangArgResult(langArg).message).to.include('Information about using the \`--lang\` flag:');
        expect(getLangArgResult(langArg).message).to.include('ember-cli command option');
        expect(getLangArgResult(langArg).result).to.be.false;
      });
    });
  });

});