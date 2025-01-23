const path = require("path");
const fs = require("fs");
const { gitDescribeSync } = require("git-describe");
const currentGitBranch = require("current-git-branch");
const { NotFoundError } = require("rest-api-errors");

// Define the root path manually if required
let appRootPath = { path: process.cwd() };

// Allow manually setting the root path if needed
function setAppRootPath(customPath) {
  appRootPath.path = customPath;
}

// Resolve paths relative to the app root path
function resolveAppPath(relativePath) {
  if (typeof relativePath !== "string") {
    throw new TypeError(`Invalid path provided: ${relativePath}. Path must be a string.`);
  }
  return path.resolve(appRootPath.path, relativePath);
}

// if (process.env.NODE_ENV !== "development" && !process.env.K_CONFIGURATION) {
//   setAppRootPath("/");
// }

// Dynamically find the main application's package.json path
function findMainPackageJsonPath() {
  let currentDir = process.cwd();

  while (currentDir) {
    const packagePath = path.join(currentDir, "package.json");
    if (fs.existsSync(packagePath)) {
      return packagePath; // Return the first package.json found
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached the root of the file system
    }

    currentDir = parentDir; // Move one level up
  }

  throw new Error(
    "ERROR: Could not locate the main application's package.json. Make sure you are running this from the root of your project."
  );
}

function ensureLibFolder() {
  const libPath = path.resolve(process.cwd(), "lib");

  // Check if the "lib" folder exists
  if (!fs.existsSync(libPath)) {
    fs.mkdirSync(libPath, { recursive: true });
    console.log(`Created 'lib' folder at: ${libPath}`);
  } else {
    console.log(`'lib' folder already exists at: ${libPath}`);
  }
}

function createDirectoryIfNotExists(filepath) {
  ensureLibFolder(); // Ensure 'lib' folder exists before proceeding

  const fullPath = path.resolve(process.cwd(), filepath);
  const dirPath = path.dirname(fullPath);

  // Create directory only if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
}

function generateFile(filepath = "./lib/build-info.json") {
  
  const { hash, tag, dirty } = gitDescribeSync();
  let name;
  let version;

  try {
    const packagePath = findMainPackageJsonPath();
    const packageInfo = require(packagePath);
    name = packageInfo.name;
    version = packageInfo.version;
  } catch (err) {
    console.error("ERROR: Command must be run from the root of your project.", err);
    throw new Error("ERROR: Command must be run from the root of your project.");
  }

  const fullPath = resolveAppPath(filepath);
  createDirectoryIfNotExists(fullPath);
  // fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  const buildInfo = {
    sha: hash.substring(1),
    tag: tag ?? "",
    branch: currentGitBranch(),
    uncommitted: dirty,
    buildDtm: new Date(),
    name,
    version,
  };

  fs.writeFileSync(fullPath, JSON.stringify(buildInfo, null, 2), "utf-8");
}

function createBuildInfoEndpoint(buildInfoPath = "/lib/build-info.json") {
  return async (_, resp, next) => {
    try {
      const buildPath = resolveAppPath(buildInfoPath);
      if(!buildPath) {
        throw new Error("build_info_not_found");
      }
      const buildInfo = require(buildPath);
      resp.status(200).send(buildInfo);
    } catch (err) {
      next(new NotFoundError("build_info_not_found", err));
    }
  };
  
}

module.exports = {
  generateFile,
  createBuildInfoEndpoint,
  setAppRootPath
};
