const appRootPath = require("app-root-path");
const { gitDescribeSync } = require("git-describe");
const currentGitBranch = require("current-git-branch");
const { NotFoundError } = require("rest-api-errors");
const path = require("path");
const fs = require("fs");

if (process.env['NODE_ENV'] !== "development" && !process.env['K_CONFIGURATION']) {
  appRootPath.setPath("/workspace");
}

function generateFile(filepath = "/lib/build-info.json") {
  const { hash, tag, dirty } = gitDescribeSync();
  let name;
  let version;

  try {
    const packageInfo = require(path.resolve("package.json"));
    name = packageInfo.name;
    version = packageInfo.version;
  } catch (err) {
    console.error("ERROR: Command must be run from the root of your project.", err);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(filepath), { recursive: true });

  const buildInfo = {
    sha: hash.substring(1),
    tag: tag ?? "",
    branch: currentGitBranch(),
    uncommitted: dirty,
    buildDtm: new Date(),
    name,
    version,
  };

  fs.writeFileSync(filepath, JSON.stringify(buildInfo, null, 2), "utf-8");
}

function createBuildInfoEndpoint(buildInfoPath = "/lib/build-info.json") {
  return async (_, resp, next) => {
    try {
      resp.status(200).send(appRootPath.require(buildInfoPath));
    } catch (err) {
      next(new NotFoundError("build_info_not_found", err));
    }
  };
}

module.exports = {
  generateFile,
  createBuildInfoEndpoint,
};
