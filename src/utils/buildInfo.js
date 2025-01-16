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
  return path.resolve(appRootPath.path, relativePath);
}

if (process.env.NODE_ENV !== "development" && !process.env.K_CONFIGURATION) {
  setAppRootPath("/workspace");
}

function generateFile(filepath = "/lib/build-info.json") {
  const { hash, tag, dirty } = gitDescribeSync();
  let name;
  let version;

  try {
    const packagePath = resolveAppPath("package.json")
    const packageInfo = require(packagePath);
    name = packageInfo.name;
    version = packageInfo.version;
  } catch (err) {
    console.error("ERROR: Command must be run from the root of your project.", err);
    throw "ERROR: Command must be run from the root of your project.";
    // process.exit(1);
  }

  const fullPath = resolveAppPath(filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

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
