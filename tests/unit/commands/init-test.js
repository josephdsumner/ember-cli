'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const expect = require('../../chai').expect;
const map = require('ember-cli-lodash-subset').map;
const MockUI = require('console-ui/mock');
const MockAnalytics = require('../../helpers/mock-analytics');
const Blueprint = require('../../../lib/models/blueprint');
const Project = require('../../../lib/models/project');
const Task = require('../../../lib/models/task');
const InitCommand = require('../../../lib/commands/init');
const MockCLI = require('../../helpers/mock-cli');
const td = require('testdouble');

describe('init command', function () {
  let ui, analytics, tasks, command, workingDir;

  beforeEach(function () {
    ui = new MockUI();
    analytics = new MockAnalytics();
    tasks = {
      GenerateFromBlueprint: Task.extend({}),
      InstallBlueprint: Task.extend({}),
      NpmInstall: Task.extend({}),
      BowerInstall: Task.extend({}),
    };

    let tmpDir = os.tmpdir();
    workingDir = `${tmpDir}/ember-cli-test-project`;
    fs.mkdirSync(workingDir);
  });

  afterEach(function () {
    fs.removeSync(workingDir);
    td.reset();
  });

  function buildCommand(projectOpts) {
    let cli = new MockCLI({ ui });
    let options = {
      ui,
      analytics,
      project: new Project(process.cwd(), projectOpts || { name: 'some-random-name' }, ui, cli),
      tasks,
      settings: {},
    };

    command = new InitCommand(options);
  }

  it("doesn't allow to create an application named `test`", function () {
    buildCommand({ name: 'test' });

    return expect(command.validateAndRun([])).to.be.rejected.then((error) => {
      expect(error.message).to.equal('We currently do not support a name of `test`.');
    });
  });

  it("doesn't allow to create an application without project name", function () {
    buildCommand({ name: undefined });

    return expect(command.validateAndRun([])).to.be.rejected.then((error) => {
      expect(error.message).to.equal(
        'The `ember init` command requires a package.json in current folder with name attribute or a specified name via arguments. For more details, use `ember help`.'
      );
    });
  });

  it('Uses the name of the closest project to when calling installBlueprint', function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.rawName).to.equal('some-random-name');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return command.validateAndRun([]).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it('Uses the provided app name over the closest found project', function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.rawName).to.equal('provided-name');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return command.validateAndRun(['--name=provided-name']).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it('Uses process.cwd if no package is found when calling installBlueprint', function () {
    // change the working dir so `process.cwd` can't be an invalid path for base directories
    // named `ember-cli`.

    let currentWorkingDir = process.cwd();

    process.chdir(workingDir);

    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.rawName).to.equal(path.basename(process.cwd()));
        return Promise.reject('Called run');
      },
    });

    buildCommand({ name: path.basename(process.cwd()) });

    return command
      .validateAndRun([])
      .catch(function (reason) {
        expect(reason).to.equal('Called run');
      })
      .then(function () {
        process.chdir(currentWorkingDir);
      });
  });

  it("doesn't use --dry-run or any other command option as the name", function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.rawName).to.equal('some-random-name');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return command.validateAndRun(['--dry-run']).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it("doesn't use . as the name", function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.rawName).to.equal('some-random-name');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return command.validateAndRun(['.']).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it('Uses the "app" blueprint by default', function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.blueprint).to.equal('app');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return command.validateAndRun(['--name=provided-name']).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it('Uses arguments to select files to init', function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.blueprint).to.equal('app');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return command.validateAndRun(['package.json', '--name=provided-name']).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it('Uses the "addon" blueprint for addons', function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts.blueprint).to.equal('addon');
        return Promise.reject('Called run');
      },
    });

    buildCommand({ keywords: ['ember-addon'], name: 'some-random-name' });

    return command.validateAndRun(['--name=provided-name']).catch(function (reason) {
      expect(reason).to.equal('Called run');
    });
  });

  it('Registers blueprint options in beforeRun', function () {
    td.replace(Blueprint, 'lookup', td.function());
    td.when(Blueprint.lookup('app'), { ignoreExtraArgs: true }).thenReturn({
      availableOptions: [{ name: 'custom-blueprint-option', type: String }],
    });

    buildCommand();

    command.beforeRun(['app']);
    expect(map(command.availableOptions, 'name')).to.contain('custom-blueprint-option');
  });

  it('Passes command options through to the install blueprint task', function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts).to.contain.keys('customOption');
        expect(blueprintOpts.customOption).to.equal('customValue');
        return Promise.reject('Called run');
      },
    });

    buildCommand();

    return expect(command.validateAndRun(['--custom-option=customValue'])).to.be.rejected.then((reason) => {
      expect(reason).to.equal('Called run');
    });
  });

  // [WIP] ember init --lang flag
  // -------------------------------
  // Good: Default
  it('ember init without --lang flag (default) has no error message before run; blueprint has lang key of empty String', async function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts).to.contain.keys('lang');
        expect(blueprintOpts.lang).to.equal('');
        return Promise.reject('Called run');
      },
    });
    buildCommand();
    let result = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git'])).to.be
      .rejected;
    expect(result).to.equal('Called run');
  });

  // Good: Correct Usage
  it('ember init with --lang flag and valid code has no error message before run; blueprint has lang key of input String', async function () {
    tasks.InstallBlueprint = Task.extend({
      run(blueprintOpts) {
        expect(blueprintOpts).to.contain.keys('lang');
        expect(blueprintOpts.lang).to.equal('en-US');
        return Promise.reject('Called run');
      },
    });
    buildCommand();
    let result = await expect(
      command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang=en-US'])
    ).to.be.rejected;
    expect(result).to.equal('Called run');
  });

  // Misuse: possibly an attempt to set app programming language
  it('ember init with --lang flag and programming language fails with an error message', async function () {
    let err = await expect(
      command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang=typescript'])
    ).to.be.rejected;
    expect(err.name).to.equal('SilentError');
    expect(err.message).to.be.ok;
    expect(err.message).to.include('An error with the `--lang` flag returned the following message:');
    expect(err.message).to.include('Information about using the `--lang` flag:');
    expect(err.message).to.include('set the app programming language');
    expect(err.message).to.include('typescript');
    expect(err.message).to.not.include('ember-cli command option');
  });

  // Misuse: No specification + declared option
  it('ember init with --lang flag but no specification fails with an error message; absorbs ember-cli option (declared)', async function () {
    let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--lang', '--skip-git'])).to.be
      .rejected;
    expect(err.name).to.equal('SilentError');
    expect(err.message).to.be.ok;
    expect(err.message).to.include('An error with the `--lang` flag returned the following message:');
    expect(err.message).to.include('Information about using the `--lang` flag:');
    expect(err.message).to.not.include('set the app programming language');
    expect(err.message).to.include('ember-cli command option');
    expect(err.message).to.include('--skip-git');
  });

  // // Misuse: No specification + hidden option
  // it('ember init with --lang flag but no specification fails with an error message; absorbs appended ember-cli option (hidden)', async function () {
  //   let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang'])).to.be.rejected;
  //   expect(err.name).to.equal('SilentError');
  //   expect(err.message).to.be.ok;
  //   expect(err.message).to.not.include('set the app programming language');
  //   expect(err.message).to.include('ember-cli command option');
  //   expect(err.message).to.include('--disable-analytics');
  // });

  // Misuse: Invalid Country Code
  it('ember init with --lang flag and invalid code fails with an error message', async function () {
    let err = await expect(command.validateAndRun(['foo', '--skip-npm', '--skip-bower', '--skip-git', '--lang=en-UK']))
      .to.be.rejected;
    expect(err.name).to.equal('SilentError');
    expect(err.message).to.be.ok;
    expect(err.message).to.include('An error with the `--lang` flag returned the following message:');
    expect(err.message).to.include('Information about using the `--lang` flag:');
    expect(err.message).to.not.include('set the app programming language');
    expect(err.message).to.not.include('ember-cli command option');
  });
});
