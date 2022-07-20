import { LogLevel, PingOneInitOptions } from '../types';
import { Logger } from '../utilities';

export class PingOneInitOptionsValidator {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Validates user passed options and gives nessessary feedback to console/through errors, will also set default values where applicable
   *
   * @param {PingOneInitOptions} options Options to be validated
   * @returns {PingOneInitOptions} options with applicable default values
   */
  validate(options: PingOneInitOptions): PingOneInitOptions {
    let error = false;

    const validLogLevels = Object.values(LogLevel);

    if (options.LoggingLevel && !validLogLevels.includes(options.LoggingLevel)) {
      // If we defaulted to warn, there's no reason to log that default was select (since that's an info level log), just want to note invalid options
      this.logger.warn('PingOneInitOptionsValidator', `options.LoggingLevel was invalid, default of warn was used, valid options are '${validLogLevels.join(', ')}'`, options.LoggingLevel);
    } else if (options.LoggingLevel === LogLevel.Debug) {
      this.logger.debug('PingOneInitOptionsValidator', 'debug logging enabled');
    }

    if (!options.PingOneAuthPath && !options.PingOneEnvId) {
      this.logger.error('PingOneInitOptionsValidator', 'You must provide a PingOneEnvId through the constructor to authorize when using the default PingOne auth path');
      error = true;
    } else {
      this.logger.debug('PingOneInitOptionsValidator', 'options verified', options);
    }

    if (error) {
      throw Error('An error occured while validating AuthZOptions, see console.error messages for more information');
    }

    return options;
  }
}

export default PingOneInitOptionsValidator;
