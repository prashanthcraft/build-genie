import { generateFile, createBuildInfoEndpoint } from "./utils/buildInfo";

const bump = require('./lib/lifecycles/bump');
const changelog = require('./lib/lifecycles/changelog');
const commit = require('./lib/lifecycles/commit');
import fs from 'fs';
import latestSemverTag from './lib/latest-semver-tag';
import path from 'path';
import printError from './lib/print-error';
const tag = require('./lib/lifecycles/tag');
import { resolveUpdaterObjectFromArgument } from './lib/updaters';
import defaults from './defaults';

interface Argv {
    m?: string;
    message?: string;
    silent?: boolean;
    changelogHeader?: string;
    header?: string;
    packageFiles?: string[];
    releaseCommitMessageFormat?: string;
    gitTagFallback?: boolean;
    tagPrefix?: string;
}

const standardVersion = async (argv: Argv) => {
    const message = argv.m || argv.message;
    if (message) {
        argv.releaseCommitMessageFormat = message.replace(/%s/g, '{{currentTag}}');
        if (!argv.silent) {
            console.warn(
                '[commit-and-tag-version]: --message (-m) will be removed in the next major release. Use --releaseCommitMessageFormat.',
            );
        }
    }

    if (argv.changelogHeader) {
        argv.header = argv.changelogHeader;
        if (!argv.silent) {
            console.warn(
                '[commit-and-tag-version]: --changelogHeader will be removed in the next major release. Use --header.',
            );
        }
    }

    if (
        argv.header &&
        argv.header.search(changelog.START_OF_LAST_RELEASE_PATTERN) !== -1
    ) {
        throw Error(
            `custom changelog header must not match ${changelog.START_OF_LAST_RELEASE_PATTERN}`,
        );
    }

    if (argv.packageFiles) {
        defaults.bumpFiles = defaults.bumpFiles.concat(argv.packageFiles);
    }

    const args = Object.assign({}, defaults, argv);
    let pkg: { version: string; private: boolean } | undefined;
    for (const packageFile of args.packageFiles) {
        const updater = resolveUpdaterObjectFromArgument(packageFile);
        if (!updater) return;
        const pkgPath = path.resolve(process.cwd(), updater.filename);
        try {
            const contents = fs.readFileSync(pkgPath, 'utf8');
            pkg = {
                version: updater.updater.readVersion(contents),
                private:
                    typeof updater.updater.isPrivate === 'function'
                        ? updater.updater.isPrivate(contents)
                        : false,
            };
            break;
        } catch (err) {
            // This probably shouldn't be empty
        }
    }
    try {
        let version: string;
        if (pkg && pkg.version) {
            version = pkg.version;
        } else if (args.gitTagFallback) {
            version = await latestSemverTag(args.tagPrefix);
        } else {
            throw new Error('no package file found');
        }

        const newVersion = await bump(args, version);
        await changelog(args, newVersion);
        await commit(args, newVersion);
        await tag(newVersion, pkg ? pkg.private : false, args);
    } catch (err: any) {
        printError(args, err?.message ?? "An error occurred");
        throw err;
    }
}

export { standardVersion, generateFile, createBuildInfoEndpoint };
