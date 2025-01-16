const fs = require("fs");
const path = require("path");
const { gitDescribeSync } = require("git-describe");
const currentGitBranch = require("current-git-branch");
const { NotFoundError } = require("rest-api-errors");
const { generateFile, setAppRootPath, createBuildInfoEndpoint } = require("../utils/buildInfo");

// Mock dependencies
jest.mock("fs");
jest.mock("path");
jest.mock("git-describe");
jest.mock("current-git-branch");
jest.mock("rest-api-errors");

describe("buildInfo.js", () => {

  describe("generateFile", () => {
    it("should throw an error if package.json is missing", () => {
      // Mock git and package info
      gitDescribeSync.mockReturnValue({ hash: "g123456", tag: "v1.0.0", dirty: false });
      currentGitBranch.mockReturnValue("main");
      jest.spyOn(path, "resolve").mockImplementation((...args) => args.join("/"));

      // Mock fs functions
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      expect(() => generateFile("/lib/build-info.json")).toThrowError(
        "ERROR: Command must be run from the root of your project."
      );
    });
    it("should generate build-info.json with correct data", () => {
      // Mock git and package info
      gitDescribeSync.mockReturnValue({ hash: "g123456", tag: "v1.0.0", dirty: false });
      currentGitBranch.mockReturnValue("main");
      jest.spyOn(path, "resolve").mockImplementation((...args) => args.join("/"));
      jest.spyOn(Date.prototype, "toISOString").mockReturnValue("2025-01-16T12:53:01.557Z");

      const packageInfo = { name: "mocked-app", version: "1.0.0" };
      jest.mock("/mocked/root/package.json", () => packageInfo, { virtual: true });

      // Mock fs functions
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      setAppRootPath("/mocked/root"); 

      expect(() => generateFile("lib/build-info.json")).not.toThrow();

      console.log(fs.writeFileSync.mock.calls);

      // Validate the output
      // expect(fs.mkdirSync).toHaveBeenCalledWith("/mocked/root/lib", { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "/mocked/root/lib/build-info.json",
        JSON.stringify(
          {
            sha: "123456",
            tag: "v1.0.0",
            branch: "main",
            uncommitted: false,
            buildDtm: "2025-01-16T12:53:01.557Z",
            name: "mocked-app",
            version: "1.0.0",
          },
          null,
          2
        ),
        "utf-8"
      );
    });
  });

  describe("createBuildInfoEndpoint", () => {
    beforeEach(() => {
      // jest.resetModules(); // Clear module cache
      jest.clearAllMocks(); // Clear all mocks
      setAppRootPath("/mocked/root"); 
    });

    it("should call next with NotFoundError if file is missing", async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const mockNext = jest.fn();
  
      jest.spyOn(require("path"), "resolve").mockReturnValue(
        "/mocked/root/lib/non-existent.json"
      );
  
      // setAppRootPath("/mocked/root");
  
      const endpoint = createBuildInfoEndpoint("lib/non-existent.json");
      await endpoint({}, mockResponse, mockNext);
  
      // Verify behaviors
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  
    it("should send build-info.json if it exists", async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const mockNext = jest.fn();
  
      jest.spyOn(require("path"), "resolve").mockReturnValue(
        "/mocked/root/lib/build-info.json"
      );
  
      jest.mock("/mocked/root/lib/build-info.json", () => ({ key: "value" }), {
        virtual: true,
      });
  
      // setAppRootPath("/mocked/root");
  
      const endpoint = createBuildInfoEndpoint("/lib/build-info.json");
      await endpoint({}, mockResponse, mockNext);
  
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({ key: "value" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  
    
  });
  
});
