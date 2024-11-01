import appRootPath from "app-root-path";
import { gitDescribeSync } from "git-describe";
import currentGitBranch from "current-git-branch";
import { NotFoundError } from "rest-api-errors";
import path from "path";
import * as fs from "fs";
import { NextFunction, Request, Response } from "express";

if (process.env.NODE_ENV !== "development" && !process.env.K_CONFIGURATION) {
  appRootPath.setPath("/workspace");
}

export function generateFile(filepath: string = "/lib/build-info.json"): void {
  const { hash, tag, dirty } = gitDescribeSync();
  let name: string;
  let version: string;

  try {
    const packageInfo = require(path.resolve("package.json"));
    name = packageInfo.name;
    version = packageInfo.version;
  } catch (err) {
    console.error("ERROR: Command must be run from the root of your project.");
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

export function createBuildInfoEndpoint(
  buildInfoPath: string = "/lib/build-info.json"
) {
  return async (req: Request, resp: Response, next: NextFunction) => {
    try {
      resp.status(200).send(appRootPath.require(buildInfoPath));
    } catch (err) {
      next(new NotFoundError("build_info_not_found"));
    }
  };
}
