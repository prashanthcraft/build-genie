#!/usr/bin/env node

/* istanbul ignore if */
if (process.version.match(/v(\d+)\./)[1] < 6) {
  console.error(
    "build-genie: Node v6 or greater is required. `build-genie` did not run."
  );
} else {
  const standardVersion = require("../src");
  const cmdParser = require("../src/command");
  standardVersion(cmdParser.argv).catch(() => {
    process.exit(1);
  });
}
