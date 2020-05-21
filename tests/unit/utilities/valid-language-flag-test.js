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
      });
    });
  });

  describe('Invalid Language Flags', function ()  {
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
      it(`'${langArg}' is an invalid language argument; unrelated to setting app programming language`, function () {
        expect(getLangArgResult(langArg).isValidLangCode).to.not.be.ok;
        expect(getLangArgResult(langArg).message).to.be.ok;
        expect(getLangArgResult(langArg).message).to.not.include('set app programming language');
      });
    });
  });
});