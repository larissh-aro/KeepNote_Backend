const LEVELS = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
let currentLevelName = (process.env.LOG_LEVEL || 'info').toLowerCase();
if (!(currentLevelName in LEVELS)) currentLevelName = 'info';

function shouldLog(level) {
  return LEVELS[level] <= LEVELS[currentLevelName];
}

function format(level, args) {
  const time = new Date().toISOString();
  const msg = Array.from(args)
    .map((a) => {
      if (a instanceof Error) return a.stack || a.message;
      try {
        return typeof a === 'object' ? JSON.stringify(a) : String(a);
      } catch (e) {
        return String(a);
      }
    })
    .join(' ');
  return `[${time}] [${level.toUpperCase()}] ${msg}`;
}

export function setLevel(lvl) {
  if (lvl && lvl.toLowerCase() in LEVELS) currentLevelName = lvl.toLowerCase();
}

export function getLevel() {
  return currentLevelName;
}

export function error(...args) {
  if (shouldLog('error')) console.error(format('error', args));
}
export function warn(...args) {
  if (shouldLog('warn')) console.warn(format('warn', args));
}
export function info(...args) {
  if (shouldLog('info')) console.log(format('info', args));
}
export function debug(...args) {
  if (shouldLog('debug')) console.log(format('debug', args));
}
export function trace(...args) {
  if (shouldLog('trace')) console.log(format('trace', args));
}

export const LEVELS_MAP = LEVELS;

export default { setLevel, getLevel, error, warn, info, debug, trace };
