const versionRegex = /^version\s+=\s+['"]([\d.]+)['"]/m;

export function readVersion(contents: string): string {
    const matches = versionRegex.exec(contents);
    if (matches === null) {
        throw new Error(
            'Failed to read the version field in your gradle file - is it present?',
        );
    }

    return matches[1];
}

export function writeVersion(contents: string, version: string): string {
    return contents.replace(versionRegex, () => {
        return `version = "${version}"`;
    });
}