# Project: Build Genie

## Table of Contents

- [Installation](#installation)
- [Features](#features)
  - [Build Information Generator](#build-information-generator)
  - [Commit and Tag Versioning](#commit-and-tag-versioning)
- [Usage](#usage)
  - [Command Line Usage](#command-line-usage)
    - [Build Information Commands](#build-information-commands)
    - [Commit and Tag Versioning Commands](#commit-and-tag-versioning-commands)
  - [Programmatic Usage](#programmatic-usage)
    - [Generating Build Information File](#generating-build-information-file)
    - [Creating Build Information Endpoint](#creating-build-information-endpoint)
    - [Automating Releases](#automating-releases)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
  - [Common Options](#common-options)
- [Examples](#examples)
  - [First Release](#first-release)
  - [Pre-Release](#pre-release)
  - [Custom Lifecycle Scripts](#custom-lifecycle-scripts)
- [CLI Usage](#cli-usage)
  - [First Release](#first-release-1)
  - [Cutting Releases](#cutting-releases)
  - [Release as a Pre-Release](#release-as-a-pre-release)
  - [Release as a Target Type Imperatively (npm version-like)](#release-as-a-target-type-imperatively-npm-version-like)
  - [Prevent Git Hooks](#prevent-git-hooks)
  - [Signing Commits and Tags](#signing-commits-and-tags)
  - [Lifecycle Scripts](#lifecycle-scripts)
  - [Skipping Lifecycle Steps](#skipping-lifecycle-steps)
  - [Committing Generated Artifacts in the Release Commit](#committing-generated-artifacts-in-the-release-commit)
  - [Dry Run Mode](#dry-run-mode)
  - [Prefix Tags](#prefix-tags)
  - [Tag replacement](#tag-replacement)
  - [Generate changelogs for old releases](#generate-changelogs-for-old-releases)
  - [CLI Help](#cli-help)
- [Code Usage](#code-usage)
- [FAQ](#faq)
  - [How is commit-and-tag-version different from semantic-release?](#how-is-commit-and-tag-version-different-from-semantic-release)
  - [Should I always squash commits when merging PRs?](#should-i-always-squash-commits-when-merging-prs)
  - [Can I use commit-and-tag-version for additional metadata files, languages or version files?](#can-i-use-commit-and-tag-version-for-additional-metadata-files-languages-or-version-files)
    - [Custom updaters](#custom-updaters)
      - [readVersion(contents = string): string](#readversioncontents--string-string)
      - [writeVersion(contents = string, version: string): string](#writeversioncontents--string-version-string-string)
- [Credits](#credits)
- [Environment Configuration](#environment-configuration)
- [Error Handling](#error-handling)
- [Running Tests](#running-tests)
- [License](#license)

---

## Installation

To install this package from the npm registry, use the following command:

```bash
npm install build-genie
```

To get started with the project from the repository, clone it and install the dependencies:

```bash
npm install
```

---

## Features

### Build Information Generator

- Generate a JSON file with details such as commit hash, tag, branch, and version.
- Serve build information via an endpoint in your application.

### Commit and Tag Versioning

- Automate versioning using [semantic versioning](https://semver.org/).
- Generate a changelog based on [conventional commits](https://conventionalcommits.org).
- Create git tags for releases and manage lifecycle scripts.
- Support for pre-releases, tag prefixes, and skipping lifecycle steps.

---

## Usage

### Command Line Usage

#### Build Information Commands

After installing the package globally or locally, you can use the `build-genie` command in the command prompt to generate the build information file:

```bash
npx build-genie generate-file --filepath /lib/build-info.json
```

This will generate a build information file at the specified location.

To create an endpoint to serve the generated information:

```bash
npx build-genie create-endpoint --buildInfoPath /lib/build-info.json
```

#### Commit and Tag Versioning Commands

To automate version bumps, changelog generation, and tagging:

```bash
npx build-genie release
```

**Examples**:
- Generate a pre-release:
  ```bash
  npx build-genie release --prerelease alpha
  ```
- Specify the release type:
  ```bash
  npx build-genie release --release-as minor
  ```
- Perform a dry run:
  ```bash
  npx build-genie release --dry-run
  ```

---

### Programmatic Usage

#### Generating Build Information File

```typescript
import { generateFile } from 'build-genie';

generateFile('/lib/build-info.json');
```

#### Creating Build Information Endpoint

```typescript
import express from 'express';
import { createBuildInfoEndpoint } from 'build-genie';

const app = express();
app.get('/build-info', createBuildInfoEndpoint('/lib/build-info.json'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### Automating Releases

```javascript
const buildGenie = require('build-genie');

buildGenie({
  noVerify: true,
  infile: 'CHANGELOG.md',
  silent: true,
})
  .then(() => {
    console.log('Release complete!');
  })
  .catch((err) => {
    console.error(`Release failed with message: ${err.message}`);
  });
```

---

## How It Works

1. Follow the [Conventional Commits Specification](https://conventionalcommits.org) in your repository.
2. When you're ready to release, run `build-genie release`.

The `release` command will:

1. Retrieve the current version of your repository by looking at `packageFiles`, falling back to the last `git tag`.
2. `Bump` the version in `bumpFiles` based on your commits.
3. Generate a `changelog` based on your commits using [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog).
4. Create a new `commit` including your `bumpFiles` and updated changelog.
5. Create a new `tag` with the new version number.

---

## Configuration

### Common Options

You can configure `build-genie` using a configuration file or by adding a stanza to your `package.json`:

- `.versionrc`, `.versionrc.json`, `.versionrc.js`
- `package.json`:
  ```json
  {
    "build-genie": {
      "releaseCount": 0
    }
  }
  ```

#### Common Options:
- `bumpFiles`: Files to bump the version in (e.g., `package.json`, `package-lock.json`).
- `skip`: Lifecycle steps to skip (e.g., `bump`, `changelog`, `commit`, `tag`).

Example:
```json
{
  "build-genie": {
    "bumpFiles": ["package.json", "package-lock.json"],
    "skip": {
      "changelog": true
    }
  }
}
```

---

## Examples

### First Release

```bash
npx build-genie release --first-release
```

### Pre-Release

```bash
npx build-genie release --prerelease beta
```

### Custom Lifecycle Scripts

Configure scripts in `package.json`:

```json
{
  "build-genie": {
    "scripts": {
      "prerelease": "echo Running prerelease tasks...",
      "postchangelog": "replace 'https://github.com/myproject/issues/' 'https://myjira/browse/' CHANGELOG.md"
    }
  }
}
```

---

## CLI Usage

### First Release

To generate your changelog for your first release, simply do:

```sh
npx build-genie release --first-release
```

This will tag a release **without bumping the version in bumpFiles**. When you are ready, push the git tag and `npm publish` your first release.

### Cutting Releases

If you typically use `npm version` to cut a new release, do this instead:

```sh
npx build-genie release
```

As long as your git commit messages are conventional and accurate, you no longer need to specify the semver type - and you get CHANGELOG generation for free!

### Release as a Pre-Release

Use the flag `--prerelease` to generate pre-releases:

```bash
npx build-genie release --prerelease beta
```

This will tag your version as: `1.0.1-beta.0`.

### Release as a Target Type Imperatively (npm version-like)

To bypass the automated version bump and specify your own target type:

```bash
npx build-genie release --release-as minor
```

### Prevent Git Hooks

To skip git hooks during the commit phase:

```bash
npx build-genie release --no-verify
```

### Signing Commits and Tags

To sign commits and tags:

```bash
npx build-genie release --sign
```

### Lifecycle Scripts

Lifecycle scripts allow you to run custom scripts at various stages of the release process.

Example configuration:

```json
{
  "build-genie": {
    "scripts": {
      "prechangelog": "echo Before generating changelog...",
      "postchangelog": "echo After generating changelog..."
    }
  }
}
```

### Skipping Lifecycle Steps

You can skip specific lifecycle steps:

```json
{
  "build-genie": {
    "skip": {
      "changelog": true
    }
  }
}
```

### Committing Generated Artifacts in the Release Commit

Use the `--commit-all` flag to commit all staged files in the release commit:

```bash
npx build-genie release --commit-all
```

### Dry Run Mode

To simulate the release process without making any changes:

```bash
npx build-genie release --dry-run
```

### Prefix Tags

To add a custom prefix to your tags:

```bash
npx build-genie release --tag-prefix @scope/package@
```

### Tag Replacement

To replace an existing tag:

```bash
npx build-genie release --tag-force
```

### Generate Changelogs for Old Releases

To regenerate changelogs for previous releases:

```json
{
  "build-genie": {
    "releaseCount": 0
  }
}
```

### CLI Help

For help with commands:

```bash
npx build-genie release --help
```

---

## Code Usage

```javascript
const buildGenie = require("build-genie");

buildGenie({
  noVerify: true,
  infile: "docs/CHANGELOG.md",
  silent: true,
})
  .then(() => {
    console.log("Release complete!");
  })
  .catch((err) => {
    console.error(`Release failed with message: ${err.message}`);
  });
```

---

## FAQ

### How is commit-and-tag-version different from semantic-release?

While both tools handle versioning and changelog generation, `build-genie` (based on `commit-and-tag-version`) focuses solely on tagging, versioning, and changelog generation without any automation in pushing to remote repositories or publishing to npm.

### Should I always squash commits when merging PRs?

Squashing commits ensures a cleaner commit history and better changelog entries. It also allows associating a single PR with one structured commit message.

### Can I use build-genie for additional metadata files, languages or version files?

Yes! You can configure additional `bumpFiles` and `packageFiles` to handle versioning in different file formats.

#### Custom Updaters

To create custom updaters for unconventional file formats, implement `readVersion` and `writeVersion` methods.

##### readVersion(contents = string): string

Reads the version from the given file contents.

##### writeVersion(contents = string, version: string): string

Writes the version to the given file contents.

---

## Credits

`build-genie` integrates functionality and concepts from the following projects:

- **[commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version):** A fork of `standard-version` that provides enhanced versioning, tagging, and changelog generation capabilities.
- **[standard-version](https://github.com/conventional-changelog/standard-version):** The original project for semantic versioning and changelog generation.

Special thanks to the maintainers of both projects for their foundational work, which serves as the basis for many of the features in `build-genie`.

---

## Environment Configuration

The `generateFile` function adjusts the `app-root-path` based on the environment. Ensure proper environment setup to avoid incorrect paths.

---

## Error Handling

- Missing files: Throws errors if required files are not found.
- Invalid configurations: Provides detailed error messages for misconfigurations.

---

## Running Tests

To run tests:

```bash
npm test
```

---

## License

This project is licensed under the ISC License.
