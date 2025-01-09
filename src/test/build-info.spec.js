const fs = require("fs");
const path = require("path");
const { gitDescribeSync } = require("git-describe");
const currentGitBranch = require("current-git-branch");
const { NotFoundError } = require("rest-api-errors");
const { generateFile, createBuildInfoEndpoint } = require("../utils/buildInfo");

jest.mock("fs");
jest.mock("git-describe");
jest.mock("current-git-branch");
jest.mock("app-root-path", () => ({
  setPath: jest.fn(),
  require: jest.fn(),
}));

describe("buildInfo module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateFile", () => {
    it("should generate build-info.json with correct content", () => {
      gitDescribeSync.mockReturnValue({ hash: "g123456", tag: "v1.0.0", dirty: false });
      currentGitBranch.mockReturnValue("main");
      const packageInfo = { name: "test-app", version: "1.0.0" };
      jest.mock(path.resolve("package.json"), () => packageInfo, { virtual: true });

      generateFile("/lib/build-info.json");

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname("/lib/build-info.json"), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "/lib/build-info.json",
        JSON.stringify({
          sha: "123456",
          tag: "v1.0.0",
          branch: "main",
          uncommitted: false,
          buildDtm: expect.any(new Date()),
          name: "test-app",
          version: "1.0.0",
        }, null, 2),
        "utf-8"
      );
    });

    it("should exit process if package.json is not found", () => {
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
      jest.mock(path.resolve("package.json"), () => { throw new Error("Not found"); }, { virtual: true });

      generateFile("../lib/build-info.json");

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe("createBuildInfoEndpoint", () => {
    it("should return build info on success", async () => {
      const mockBuildInfo = { sha: "123456", tag: "v1.0.0", branch: "main", uncommitted: false, buildDtm: new Date(), name: "test-app", version: "1.0.0" };
      const mockReq = {};
      const mockResp = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const mockNext = jest.fn();
      require("app-root-path").require.mockReturnValue(mockBuildInfo);

      const endpoint = createBuildInfoEndpoint("/lib/build-info.json");
      await endpoint(mockReq, mockResp, mockNext);

      expect(mockResp.status).toHaveBeenCalledWith(200);
      expect(mockResp.send).toHaveBeenCalledWith(mockBuildInfo);
    });

    it("should call next with NotFoundError if build info is not found", async () => {
      const mockReq = {};
      const mockResp = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const mockNext = jest.fn();
      const mockError = new Error("Not found");
      require("app-root-path").require.mockImplementation(() => { throw mockError; });

      const endpoint = createBuildInfoEndpoint("/lib/build-info.json");
      await endpoint(mockReq, mockResp, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new NotFoundError("build_info_not_found", mockError));
    });
  });
});