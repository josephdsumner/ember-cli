'use-strict';

const isValidLanguageFlag = require('../../../lib/utilities/valid-language-flag');
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
    ].forEach((languageFlag) => {
      it(`'${languageFlag}' is a valid language code`, function () {
        expect(isValidLanguageFlag(languageFlag)).to.be.ok;
      });
    });
});