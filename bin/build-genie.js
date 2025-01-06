#!/usr/bin/env node

const { generateFile, createBuildInfoEndpoint } = require('../dist/index');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { standardVersion } = require('../src');
const cmdParser = require('../src/command');

const argv = yargs(hideBin(process.argv))
  .command('generate-file', 'Generate the build info file', {
    filepath: {
      description: 'The path where the build information file should be generated',
      alias: 'f',
      type: 'string',
      default: '/lib/build-info.json'
    }
  }, (args) => {
    generateFile(args.filepath);
  })
  .command('create-endpoint', 'Create a build information endpoint', {
    buildInfoPath: {
      description: 'The path to the build information file',
      alias: 'b',
      type: 'string',
      default: '/lib/build-info.json'
    }
  }, () => {
    console.log("Create an endpoint using the exported function in your server.");
  })
  .command('commit-and-tag-version', 'Create Commit and Tag information for the build', {
    buildInfoPath: {
      description: 'The path to the build information file',
      alias: 'b',
      type: 'string',
      default: '/lib/build-info.json'
    }
  }, () => {
    if(process.version.match(/v(\d+)\./)[1] < 6) {
      console.error(
        "commit-and-tag-version: Node v6 or greater is required. `commit-and-tag-version` did not run."
      );
    }
    console.log("Creating commit and tag information for the build...");
    standardVersion(cmdParser.argv).catch(() => {
      process.exit(1);
    });
  })
  .help()
  .alias('help', 'h')
  .argv;
