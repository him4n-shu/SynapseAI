/**
 * Logger utility that respects environment
 * In production, logs are disabled by default
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Logger class
 */
class Logger {
  constructor(enabled = isDevelopment) {
    this.enabled = enabled;
  }

  /**
   * Debug log (only in development)
   */
  debug(...args) {
    if (this.enabled && isDevelopment) {
      console.log('🔍', ...args);
    }
  }

  /**
   * Info log
   */
  info(...args) {
    if (this.enabled) {
      console.log('ℹ️', ...args);
    }
  }

  /**
   * Warning log
   */
  warn(...args) {
    if (this.enabled) {
      console.warn('⚠️', ...args);
    }
  }

  /**
   * Error log (always enabled)
   */
  error(...args) {
    console.error('❌', ...args);
  }

  /**
   * Success log
   */
  success(...args) {
    if (this.enabled) {
      console.log('✅', ...args);
    }
  }

  /**
   * Enable logging
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable logging
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Create singleton instance
const logger = new Logger();

// Export logger instance
export default logger;

// Export individual methods for convenience
export const { debug, info, warn, error, success } = logger;

// Export LogLevel enum
export { LogLevel };

// In production, override console methods to use logger
if (isProduction) {
  const originalConsole = { ...console };
  
  console.log = (...args) => {
    // Only log errors and warnings in production
  };
  
  console.debug = (...args) => {
    // Disabled in production
  };
  
  console.info = (...args) => {
    // Disabled in production
  };
  
  console.warn = (...args) => {
    originalConsole.warn(...args);
  };
  
  console.error = (...args) => {
    originalConsole.error(...args);
  };
}

