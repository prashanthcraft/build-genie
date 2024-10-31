# Project: Build Information Generator

This project provides utility functions to generate and serve build information about the current state of the project, including commit hash, tag, branch, and version. The two main functionalities include generating a build information JSON file and creating an endpoint to access this information.

## Installation

To install this package from the npm registry, use the following command:

```bash
npm install build-genie
```

To get started with the project from the repository, clone it and install the dependencies:

```bash
npm install
```

## Usage

### Generating Build Information File

After installing the package, you can generate the build information file as follows:

```typescript
import { generateFile } from 'build-genie';

generateFile('/lib/build-info.json');
```

### Creating Build Information Endpoint

To create an endpoint to serve the build information file:

```typescript
import express from 'express';
import { createBuildInfoEndpoint } from 'build-genie';

const app = express();
app.get('/build-info', createBuildInfoEndpoint('/lib/build-info.json'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Functions Overview

### 1. `generateFile(filepath: string = '/lib/build-info.json')`

This function generates a build information file containing details such as the commit SHA, tag, branch name, build date, and project version. It reads information from the Git repository and `package.json` to create a JSON file.

#### Example Usage

```typescript
import { generateFile } from './utils/buildInfo';

generateFile('/lib/build-info.json');
```

#### Parameters
- `filepath`: The path where the build information file will be generated. Defaults to `/lib/build-info.json`.

#### Generated File Content
- `sha`: Shortened commit hash.
- `tag`: Git tag (if available).
- `branch`: Current branch name.
- `uncommitted`: Boolean indicating if there are uncommitted changes.
- `buildDtm`: Date and time of the build.
- `name`: Name of the project (from `package.json`).
- `version`: Version of the project (from `package.json`).

### 2. `createBuildInfoEndpoint(buildInfoPath: string = '/lib/build-info.json')`

This function creates an Express.js middleware endpoint to serve the generated build information file.

#### Example Usage

```typescript
import express from 'express';
import { createBuildInfoEndpoint } from './utils/buildInfo';

const app = express();
app.get('/build-info', createBuildInfoEndpoint('/lib/build-info.json'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### Parameters
- `buildInfoPath`: The path to the build information file. Defaults to `/lib/build-info.json`.

## Environment Configuration

The `generateFile` function adjusts the `app-root-path` based on the environment. If the environment is not development (`NODE_ENV !== 'development'`) and the `K_CONFIGURATION` variable is not set, it will set the root path to `/workspace`.

Ensure that your environment is properly configured to avoid incorrect file paths.

## Error Handling

- If the `package.json` cannot be found, the `generateFile` function will log an error and exit the process.
- The `createBuildInfoEndpoint` function uses `rest-api-errors` to handle missing files. If the build information file is not found, it will call `next` with a `NotFoundError`.

## Running Tests

This project includes Mocha test cases to verify the functionality of `generateFile` and `createBuildInfoEndpoint`.

To run the tests:

```bash
npm test
```

## License

This project is licensed under the MIT License.

## Publishing the Package

To publish this package to the npm registry, use the following script:

```bash
npm run publish
```

Ensure you are logged in to npm before running the script.


