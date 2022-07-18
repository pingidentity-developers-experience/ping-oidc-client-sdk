// This is the one entry point we want to be able to pass stuff to the console.
/* eslint-disable no-console */
import { LogLevel } from '../types';

export class Logger {
  private readonly logLevel: LogLevel;

  constructor(level?: LogLevel) {
    // Default level to Warning
    this.logLevel = level || LogLevel.Warning;
  }

  /**
   * Calls console.error with provided information, will always be called
   *
   * @param {string} className Class where error originated from
   * @param {string} error Error message that will displayed in the console
   * @param {object} additionalData Optional additional data that will be shown in console
   */
  error(className: string, error: string, additionalData?: any): void {
    if (additionalData) {
      console.error(className, error, additionalData);
    } else {
      console.error(className, error);
    }
  }

  /**
   * Calls console.warn with provided information,
   * will only be called if LogLevel is Debug, Info or Warning
   *
   * @param {string} className Class where warning originated from
   * @param {string} warning Warning message that will displayed in the console
   * @param {object} additionalData Optional additional data that will be shown in console
   */
  warn(className: string, warning: string, additionalData?: any): void {
    const logConditions = [LogLevel.Debug, LogLevel.Info, LogLevel.Warning];
    if (!logConditions.includes(this.logLevel)) {
      return;
    }

    if (additionalData) {
      console.warn(className, warning, additionalData);
    } else {
      console.warn(className, warning);
    }
  }

  /**
   * Calls console.info with provided information,
   * will only be called if LogLevel is Debug or Info
   *
   * @param {string} className Class where info message originated from
   * @param {string} message Info message that will displayed in the console
   * @param {object} additionalData Optional additional data that will be shown in console
   */
  info(className: string, message: string, additionalData?: any): void {
    const logConditions = [LogLevel.Debug, LogLevel.Info];
    if (!logConditions.includes(this.logLevel)) {
      return;
    }

    if (additionalData) {
      console.info(className, message, additionalData);
    } else {
      console.info(className, message);
    }
  }

  /**
   * Calls console.debug with provided information,
   * will only be called if LogLevel is Debug
   *
   * @param {string} className Class where debug message originated from
   * @param {string} message Debug message that will displayed in the console
   * @param {object} additionalData Optional additional data that will be shown in console
   */
  debug(className: string, message: string, additionalData?: any): void {
    const logConditions = [LogLevel.Debug];
    if (!logConditions.includes(this.logLevel)) {
      return;
    }

    if (additionalData) {
      console.debug(className, message, additionalData);
    } else {
      console.debug(className, message);
    }
  }
}

export default Logger;
