'use-strict';

const getLangArgResult = require('../../../lib/utilities/valid-language-flag');
const expect = require('chai').expect;

describe('lib/utilities/valid-language-flag', function () {

  describe('Valid Language Flags', function () {
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

  describe('Invalid Language Flags: Misc.', function ()  {
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
        expect(getLangArgResult(langArg).message).to.include('An error with the \`--language\` flag returned the following message:');
        expect(getLangArgResult(langArg).message).to.include('Information about using the \`--language\` flag:');
        expect(getLangArgResult(langArg).message).to.not.include('set the app programming language');
        expect(getLangArgResult(langArg).message).to.not.include('ember-cli command option');
        expect(getLangArgResult(langArg).result).to.be.false;
      });
    });
  });

  describe('Invalid Language Flags, Misuse case: Programming Languages', function ()  {
    [
      'typescript',
      'javascript',
      'html',
      'glimmer',
      'emcas',
      'es6',
      'node',
      'handlebars'
    ].forEach((langArg) => {
      it(`'${langArg}' is an invalid language argument; possibly an attempt to set app programming language`, function () {
        expect(getLangArgResult(langArg).isValidLangCode).to.not.be.ok;
        expect(getLangArgResult(langArg).message).to.be.ok;
        expect(getLangArgResult(langArg).message).to.include('An error with the \`--language\` flag returned the following message:');
        expect(getLangArgResult(langArg).message).to.include('Information about using the \`--language\` flag:');
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
        expect(getLangArgResult(langArg).message).to.include('An error with the \`--language\` flag returned the following message:');
        expect(getLangArgResult(langArg).message).to.include('Information about using the \`--language\` flag:');
        expect(getLangArgResult(langArg).message).to.include('ember-cli command option');
        expect(getLangArgResult(langArg).result).to.be.false;
      });
    });
  });

});