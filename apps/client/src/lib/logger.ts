/* eslint-disable @typescript-eslint/no-explicit-any */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatMessage(level: LogLevel, message: string) {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${level.toUpperCase()}] - ${message}`;
}

export const logger = {
  debug: (msg: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', msg), ...args);
    }
  },
  info: (msg: string, ...args: any[]) => {
    console.info(formatMessage('info', msg), ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(formatMessage('warn', msg), ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(formatMessage('error', msg), ...args);
  },
};
