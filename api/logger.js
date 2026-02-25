// ─── Structured JSON Logger ───
// Lightweight logger that outputs JSON lines for easy parsing
// Compatible with Docker json-file driver, Grafana Loki, ELK, etc.

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[LOG_LEVEL] ?? 1;

function formatLog(level, module, message, extra = {}) {
    const entry = {
        time: new Date().toISOString(),
        level,
        module,
        msg: message,
        ...extra,
    };

    // Remove undefined values
    for (const k of Object.keys(entry)) {
        if (entry[k] === undefined) delete entry[k];
    }

    return JSON.stringify(entry);
}

function createLogger(module) {
    return {
        debug: (msg, extra) => {
            if (currentLevel <= LEVELS.debug) process.stdout.write(formatLog('debug', module, msg, extra) + '\n');
        },
        info: (msg, extra) => {
            if (currentLevel <= LEVELS.info) process.stdout.write(formatLog('info', module, msg, extra) + '\n');
        },
        warn: (msg, extra) => {
            if (currentLevel <= LEVELS.warn) process.stderr.write(formatLog('warn', module, msg, extra) + '\n');
        },
        error: (msg, extra) => {
            if (currentLevel <= LEVELS.error) process.stderr.write(formatLog('error', module, msg, extra) + '\n');
        },
    };
}

export default createLogger;
