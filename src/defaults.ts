import * as spec from 'conventional-changelog-config-spec';

interface Defaults {
    infile: string;
    firstRelease: boolean;
    sign: boolean;
    signoff: boolean;
    noVerify: boolean;
    commitAll: boolean;
    silent: boolean;
    tagPrefix: string;
    releaseCount: number;
    scripts: Record<string, unknown>;
    skip: Record<string, unknown>;
    dryRun: boolean;
    tagForce: boolean;
    gitTagFallback: boolean;
    preset: string;
    npmPublishHint?: string;
    header?: string;
    packageFiles: string[];
    bumpFiles: string[];
}

const defaults: Defaults = {
    infile: 'CHANGELOG.md',
    firstRelease: false,
    sign: false,
    signoff: false,
    noVerify: false,
    commitAll: false,
    silent: false,
    tagPrefix: 'v',
    releaseCount: 1,
    scripts: {},
    skip: {},
    dryRun: false,
    tagForce: false,
    gitTagFallback: true,
    preset: require.resolve('conventional-changelog-conventionalcommits'),
    npmPublishHint: undefined,
    packageFiles: ['package.json', 'bower.json', 'manifest.json'],
    bumpFiles: [],
};

/**
 * Merge in defaults provided by the spec
 */
Object.keys(spec.properties).forEach((propertyKey) => {
    const property = spec.properties[propertyKey];
    (defaults as any)[propertyKey] = property.default;
});

/**
 * Sets the default for `header` (provided by the spec) for backwards
 * compatibility. This should be removed in the next major version.
 */
defaults.header =
    '# Changelog\n\nAll notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.\n';

defaults.bumpFiles = defaults.packageFiles.concat([
    'package-lock.json',
    'npm-shrinkwrap.json',
]);

export default defaults;