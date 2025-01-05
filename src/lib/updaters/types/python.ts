const versionExtractRegex = /version[" ]*=[ ]*["'](.*)["']/i;

interface VersionIndex {
  version: string | undefined;
  lineNumber: number;
}

const getVersionIndex = function (lines: string[]): VersionIndex {
  let version: string | undefined;
  const lineNumber = lines.findIndex((line) => {
    const versionMatcher = line.match(versionExtractRegex);
    // if version not found in lines provided, return false
    if (versionMatcher == null) {
      return false;
    }
    version = versionMatcher[1];
    return true;
  });
  return { version, lineNumber };
};

export const readVersion = function (contents: string): string | undefined {
  const lines = contents.split('\n');
  const versionIndex = getVersionIndex(lines);
  return versionIndex.version;
};

export const writeVersion = function (contents: string, version: string): string {
  const lines = contents.split('\n');
  const versionIndex = getVersionIndex(lines);
  if (versionIndex.lineNumber === -1 || versionIndex.version === undefined) {
    throw new Error('Version not found in contents');
  }
  const versionLine = lines[versionIndex.lineNumber];
  const newVersionLine = versionLine.replace(versionIndex.version, version);
  lines[versionIndex.lineNumber] = newVersionLine;
  return lines.join('\n');
};