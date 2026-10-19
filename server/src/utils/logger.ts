type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
): void {
    const line = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(meta ? { meta } : {}),
    };

    const output = JSON.stringify(line);

    if (level === 'error') {
        console.error(output);
    } else if (level === 'warn') {
        console.warn(output);
    } else {
        console.log(output);
    }
}

export const logger = {
    info: (
        message: string,
        meta?: Record<string, unknown>,
    ) => log('info', message, meta),

    warn: (
        message: string,
        meta?: Record<string, unknown>,
    ) => log('warn', message, meta),

    error: (
        message: string,
        meta?: Record<string, unknown>,
    ) => log('error', message, meta),

    debug: (
        message: string,
        meta?: Record<string, unknown>,
    ) => log('debug', message, meta),
};