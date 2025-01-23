#!/usr/bin/env node

const { handleGenerateFile, handleCreateEndpoint } = require('../src/build-genie-command');

/* istanbul ignore if */
if (process.version.match(/v(\d+)\./)[1] < 6) {
  console.error(
    'build-genie: Node v6 or greater is required. `build-genie` did not run.',
  );
} else {
  const standardVersion = require('../src');
  const {cmdParser} = require('../src/command');
  const yargs = require('yargs');
  const argv = yargs.argv;

  const command = argv._[0]; // Get the first positional argument (command)

  if (command === 'generate-file') {
    handleGenerateFile(argv);
  } else if (command === 'create-endpoint') {
    handleCreateEndpoint(argv);
  } else {
    standardVersion(cmdParser.argv).catch(() => {
      process.exit(1);
    });
  }
}
