/**
 * Development Logger Utility
 * 
 * Provides logging functions that only output in development mode.
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

function createLogger(level: LogLevel) {
  return (...args: unknown[]) => {
    if (isDev) {
      const prefix = `[${level.toUpperCase()}]`;
      console[level](prefix, ...args);
    }
  };
}

/**
 * Development-only logger
 * Only logs in development mode (NODE_ENV === 'development')
 */
export const devLog = {
  log: createLogger('log'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
  debug: createLogger('debug'),
  
  /**
   * Log with a specific namespace/component for easier filtering
   */
  component: (name: string) => ({
    log: (...args: unknown[]) => isDev && console.log(`[${name}]`, ...args),
    info: (...args: unknown[]) => isDev && console.info(`[${name}]`, ...args),
    warn: (...args: unknown[]) => isDev && console.warn(`[${name}]`, ...args),
    error: (...args: unknown[]) => isDev && console.error(`[${name}]`, ...args),
    debug: (...args: unknown[]) => isDev && console.debug(`[${name}]`, ...args),
  }),
};

export default devLog;
