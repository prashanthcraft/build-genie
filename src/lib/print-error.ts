import chalk from 'chalk';

interface Options {
    level?: 'error' | 'warn' | 'info' | 'log';
    color?: keyof typeof chalk;
}

interface Args {
    silent?: boolean;
}

export default function (args: Args, msg: string, opts: Options = {}): void {
    if (!args.silent) {
        opts = {
            level: 'error',
            color: 'red',
            ...opts,
        };

        if (opts.level && opts.color) {
            console[opts.level](chalk.hex(opts.color)(msg));
        }
    }
}