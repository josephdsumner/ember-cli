'use strict';

const fs = require('fs-extra');
const chalk = require('chalk');
const Command = require('../models/command');
const Project = require('../models/project');
const SilentError = require('silent-error');
const isValidProjectName = require('../utilities/valid-project-name');
const normalizeBlueprint = require('../utilities/normalize-blueprint-option');
const mergeBlueprintOptions = require('../utilities/merge-blueprint-options');
const getLangArgInfo = require('../../lib/utilities/valid-lang-flag');

module.exports = Command.extend({
  name: 'new',
  description: `Creates a new directory and runs ${chalk.green('ember init')} in it.`,
  works: 'outsideProject',

  availableOptions: [
    { name: 'dry-run', type: Boolean, default: false, aliases: ['d'] },
    { name: 'verbose', type: Boolean, default: false, aliases: ['v'] },
    { name: 'blueprint', type: String, default: 'app', aliases: ['b'] },
    { name: 'skip-npm', type: Boolean, default: false, aliases: ['sn'] },
    { name: 'skip-bower', type: Boolean, default: false, aliases: ['sb'] },
    { name: 'skip-git', type: Boolean, default: false, aliases: ['sg'] },
    {
      name: 'welcome',
      type: Boolean,
      default: true,
      description: 'Installs and uses {{ember-welcome-page}}. Use --no-welcome to skip it.',
    },
    { name: 'yarn', type: Boolean }, // no default means use yarn if the blueprint has a yarn.lock
    { name: 'directory', type: String, aliases: ['dir'] },
    {
      name: 'language',
      type: String,
      default: '',
      description: 'Sets the base human language of the application via index.html',
      aliases: ['l', 'lang'],
    },
  ],

  anonymousOptions: ['<app-name>'],

  beforeRun: mergeBlueprintOptions,

  async run(commandOptions, rawArgs) {
    let projectName = rawArgs[0],
      message;

    commandOptions.name = rawArgs.shift();

    if (!projectName) {
      message = `The \`ember ${this.name}\` command requires a name to be specified. For more details, use \`ember help\`.`;

      return Promise.reject(new SilentError(message));
    }

    if (commandOptions.dryRun) {
      commandOptions.skipGit = true;
    }

    if (projectName === '.') {
      let blueprintName = commandOptions.blueprint === 'app' ? 'application' : commandOptions.blueprint;
      message = `Trying to generate an ${blueprintName} structure in this directory? Use \`ember init\` instead.`;

      return Promise.reject(new SilentError(message));
    }

    if (!isValidProjectName(projectName)) {
      message = `We currently do not support a name of \`${projectName}\`.`;

      return Promise.reject(new SilentError(message));
    }
    
    // [WIP] ember new foo --lang
    let langDef = this.availableOptions.find(opt => opt.name === 'language').default;
    let langInfo = getLangArgInfo(commandOptions.language);
    if( (langInfo.langArgValue !== langDef) && !langInfo.result )  {
      return Promise.reject(new SilentError(langInfo.message));
    }
    commandOptions.language = langInfo.langArgValue;

    commandOptions.blueprint = normalizeBlueprint(commandOptions.blueprint);

    let InitCommand = this.commands.Init;

    let initCommand = new InitCommand({
      ui: this.ui,
      analytics: this.analytics,
      tasks: this.tasks,
      project: Project.nullProject(this.ui, this.cli),
    });

    let opts = await this.runTask('CreateAndStepIntoDirectory', {
      projectName,
      directoryName: commandOptions.directory,
      dryRun: commandOptions.dryRun,
    });

    initCommand.project.root = process.cwd();

    try {
      let response = await initCommand.run(commandOptions, rawArgs);
      return response;
    } catch (err) {
      let { initialDirectory, projectDirectory } = opts;

      process.chdir(initialDirectory);
      await fs.remove(projectDirectory);

      console.log(chalk.red(`Error creating new application. Removing generated directory \`./${projectDirectory}\``));
      throw err;
    }
  },
});
