/* eslint-disable camelcase */
import { AuthMethod, ClientOptions, StorageType, ValidatedClientOptions } from '../types';
import ResponseType from '../types/response-type';
import { BrowserUrlManager, Logger } from '../utilities';

export class ClientOptionsValidator {
  private readonly logger: Logger;
  private readonly browserUrlManager: BrowserUrlManager;

  constructor(logger: Logger, browserUrlManager: BrowserUrlManager) {
    this.logger = logger;
    this.browserUrlManager = browserUrlManager;
  }

  /**
   * Validates user passed options and gives necessary feedback to console/through errors, will also set default values where applicable
   *
   * @param {ClientOptions} options Options to be validated
   * @returns {ClientOptions} options with applicable default values
   */
  validate(options: ClientOptions): ValidatedClientOptions {
    let error = false;

    // Need to validate required properties, users may not be using typescript so double-check them
    if (!options.client_id) {
      this.logger.error('ClientOptionsValidator', 'options.client_id is required to send an authorization request');
      error = true;
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.client_id verified', options.client_id);
    }

    const { currentUrl } = this.browserUrlManager;

    if (!options.redirect_uri) {
      if (!currentUrl) {
        this.logger.error('ClientOptionsValidator', 'options.redirect_uri is required to send an authorization request');
        error = true;
      } else {
        this.logger.info('ClientOptionsValidator', 'options.redirect_uri not passed in, defaulting to current browser URL', currentUrl);
      }
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.redirect_uri verified', options.redirect_uri);
    }

    if (error) {
      throw Error('An error occurred while validating ClientOptions, client_id and redirect_uri are required.');
    }

    const result: ValidatedClientOptions = {
      client_id: options.client_id,
      redirect_uri: options.redirect_uri || currentUrl,
      response_type: this.getValueOrDefaultFromEnum<ResponseType>(ResponseType, 'options.response_type', ResponseType.AuthorizationCode, options.response_type),
      scope: this.getScope(options),
      usePkce: this.getUsePkce(options),
      state: options.state,
      storageType: this.getValueOrDefaultFromEnum<StorageType>(StorageType, 'options.storageType', StorageType.Local, options.storageType),
      customParams: options.customParams,
      authMethod: this.getValueOrDefaultFromEnum<AuthMethod>(AuthMethod, 'options.authMethod', AuthMethod.Redirect, options.authMethod),
    };

    return result;
  }

  private getUsePkce(options: ClientOptions): boolean {
    if (typeof options.usePkce === 'boolean') {
      this.logger.debug('ClientOptionsValidator', 'options.usePkce boolean was provided', options.usePkce);
      return options.usePkce;
    }

    if (options.usePkce === undefined || options.usePkce === null) {
      this.logger.info('ClientOptionsValidator', 'options.usePkce not provided, defaulting to true');
      return true;
    }

    this.logger.warn('ClientOptionsValidator', 'options.usePkce contains an invalid value, expecting a boolean, defaulting to true', options.usePkce);
    return true;
  }

  /**
   * Does verification of Scope sent in through options and sets default of 'openid profile' if not present or invalid
   *
   * @param {ClientOptions} options Options sent into authorize method
   * @returns {string} Scope that will be passed to PingOne endpoint
   */
  private getScope(options: ClientOptions): string {
    const defaultScope = 'openid profile email';

    if (!options.scope) {
      this.logger.info('ClientOptionsValidator', `options.Scope not provided, defaulting to '${defaultScope}'`);
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.Scope passed', options.scope);
    }

    return options.scope || defaultScope;
  }

  private getValueOrDefaultFromEnum<T>(type: any, parameterName: string, defaultValue: T, providedValue?: T): T {
    let determinedValue = providedValue;
    const validValues = Object.values(type);

    if (!validValues.includes(determinedValue)) {
      determinedValue = defaultValue;

      if (providedValue) {
        this.logger.warn('ClientOptionsValidator', `${parameterName} contained an invalid option, valid options are '${validValues.join(', ')}'`, defaultValue);
      } else {
        this.logger.info('ClientOptionsValidator', `${parameterName} not provided, default to '${defaultValue}'`);
      }
    } else {
      this.logger.debug('ClientOptionsValidator', `${parameterName} passed and valid`, providedValue);
    }

    return determinedValue;
  }
}
