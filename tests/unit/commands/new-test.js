'use strict';

const expect = require('../../chai').expect;
const map = require('ember-cli-lodash-subset').map;
const commandOptions = require('../../factories/command-options');
const NewCommand = require('../../../lib/commands/new');
const Blueprint = require('../../../lib/models/blueprint');
const Command = require('../../../lib/models/command');
const Task = require('../../../lib/models/task');
const td = require('testdouble');

describe('new command', function () {
  let command;

  beforeEach(function () {
    let options = commandOptions({
      project: {
        isEmberCLIProject() {
          return false;
        },
        blueprintLookupPaths() {
          return [];
        },
      },
    });

    command = new NewCommand(options);

    td.replace(Blueprint, 'lookup', td.function());
  });

  afterEach(function () {
    td.reset();
  });

  it("doesn't allow to create an application named `test`", async function () {
    let { message } = await expect(command.validateAndRun(['test'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `test`.');
  });

  it("doesn't allow to create an application named `ember`", async function () {
    let { message } = await expect(command.validateAndRun(['ember'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `ember`.');
  });

  it("doesn't allow to create an application named `Ember`", async function () {
    let { message } = await expect(command.validateAndRun(['Ember'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `Ember`.');
  });

  it("doesn't allow to create an application named `ember-cli`", async function () {
    let { message } = await expect(command.validateAndRun(['ember-cli'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `ember-cli`.');
  });

  it("doesn't allow to create an application named `vendor`", async function () {
    let { message } = await expect(command.validateAndRun(['vendor'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `vendor`.');
  });

  it("doesn't allow to create an application with a period in the name", async function () {
    let { message } = await expect(command.validateAndRun(['zomg.awesome'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `zomg.awesome`.');
  });

  it("doesn't allow to create an application with a name beginning with a number", async function () {
    let { message } = await expect(command.validateAndRun(['123-my-bagel'])).to.be.rejected;
    expect(message).to.equal('We currently do not support a name of `123-my-bagel`.');
  });

  it('shows a suggestion messages when the application name is a period', async function () {
    let { message } = await expect(command.validateAndRun(['.'])).to.be.rejected;
    expect(message).to.equal(
      `Trying to generate an application structure in this directory? Use \`ember init\` instead.`
    );
  });

  it('registers blueprint options in beforeRun', function () {
    td.when(Blueprint.lookup('app'), { ignoreExtraArgs: true }).thenReturn({
      availableOptions: [{ name: 'custom-blueprint-option', type: String }],
    });

    command.beforeRun(['app']);
    expect(map(command.availableOptions, 'name')).to.contain('custom-blueprint-option');
  });

  it('passes command options through to init command', async function () {
    command.tasks.CreateAndStepIntoDirectory = Task.extend({
      run() {
        return Promise.resolve();
      },
    });

    command.commands.Init = Command.extend({
      run(commandOptions) {
        expect(commandOptions).to.contain.keys('customOption');
        expect(commandOptions.customOption).to.equal('customValue');
        return Promise.resolve('Called run');
      },
    });

    td.when(Blueprint.lookup('app'), { ignoreExtraArgs: true }).thenReturn({
      availableOptions: [{ name: 'custom-blueprint-option', type: String }],
    });

    let reason = await command.validateAndRun(['foo', '--custom-option=customValue']);
    expect(reason).to.equal('Called run');
  });

  // [WIP] ember new --lang flag
  // -------------------------------
  // Good: Default
  it('ember new without --lang flag (default) has no error message before run; blueprint has lang key of empty String', async function () {
    command.tasks.CreateAndStepIntoDirectory = Task.extend({
      run() {
        return Promise.resolve();
      },
    });
    command.commands.Init = Command.extend({
      run(commandOptions) {
        expect(commandOptions).to.contain.keys('lang');
        expect(commandOptions.lang).to.equal('');
        return Promise.resolve('Called run');
      },
    });
    let reason = await command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git']);
    expect(reason).to.equal('Called run');
  });

  // Good: Correct Usage
  it('ember new with --lang flag and valid code has no error message before run; blueprint has lang key of input String', async function () {
    command.tasks.CreateAndStepIntoDirectory = Task.extend({
      run() {
        return Promise.resolve();
      },
    });
    command.commands.Init = Command.extend({
      run(commandOptions) {
        expect(commandOptions).to.contain.keys('lang');
        expect(commandOptions.lang).to.equal('en-US');
        return Promise.resolve('Called run');
      },
    });
    let reason = await command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang=en-US']);
    expect(reason).to.equal('Called run');
  });

  // Misuse: possibly an attempt to set app programming language
  it('ember new with --lang flag and programming language fails with an error message', async function () {
    let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang=typescript'])).to.be.rejected;
    expect(err.name).to.equal('SilentError');
    expect(err.message).to.be.ok;
    expect(err.message).to.include('An error with the \`--lang\` flag returned the following message:');
    expect(err.message).to.include('Information about using the \`--lang\` flag:');
    expect(err.message).to.include('set the app programming language');
    expect(err.message).to.include('typescript');
    expect(err.message).to.not.include('ember-cli command option');
  });

  // Misuse: No specification + declared option
  it('ember new with --lang flag but no specification fails with an error message; absorbs ember-cli option (declared)', async function () {
    let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--lang', '--skip-git'])).to.be.rejected;
    expect(err.name).to.equal('SilentError');
    expect(err.message).to.be.ok;
    expect(err.message).to.include('An error with the \`--lang\` flag returned the following message:');
    expect(err.message).to.include('Information about using the \`--lang\` flag:');
    expect(err.message).to.not.include('set the app programming language');
    expect(err.message).to.include('ember-cli command option');
    expect(err.message).to.include('--skip-git');

  });  

  // // Misuse: No specification + hidden option
  // it('ember new with --lang flag but no specification fails with an error message; absorbs appended ember-cli option (hidden)', async function () {
  //   let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang'])).to.be.rejected;
  //   expect(err.name).to.equal('SilentError');
  //   expect(err.message).to.be.ok;
  //   expect(err.message).to.not.include('set the app programming language');
  //   expect(err.message).to.include('ember-cli command option');
  //   expect(err.message).to.include('--disable-analytics');
  // });  
  
  // Misuse: Invalid Country Code
  it('ember new with --lang flag and invalid code fails with an error message', async function () {
    let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang=en-UK'])).to.be.rejected;
    expect(err.name).to.equal('SilentError');
    expect(err.message).to.be.ok;
    expect(err.message).to.include('An error with the \`--lang\` flag returned the following message:');
    expect(err.message).to.include('Information about using the \`--lang\` flag:');
    expect(err.message).to.not.include('set the app programming language');
    expect(err.message).to.not.include('ember-cli command option');
  });

});
