import { ClientOptions, ValidatedClientOptions } from '../types';
import GrantType from '../types/grant-type';
import { BrowserUrlManager, Logger } from '../utilities';

export class ClientOptionsValidator {
  private readonly logger: Logger;
  private readonly browserUrlManager: BrowserUrlManager;

  constructor(logger: Logger, browserUrlManager: BrowserUrlManager) {
    this.logger = logger;
    this.browserUrlManager = browserUrlManager;
  }

  /**
   * Validates user passed options and gives nessessary feedback to console/through errors, will also set default values where applicable
   *
   * @param {ClientOptions} options Options to be validated
   * @returns {ClientOptions} options with applicable default values
   */
  validate(options: ClientOptions): ValidatedClientOptions {
    let error = false;

    // Need to validate required properies, users may not be using typescript so doublecheck them
    if (!options.clientId) {
      this.logger.error('ClientOptionsValidator', 'options.clientId is required to send an authorization request');
      error = true;
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.clientId verified', options.clientId);
    }

    const { currentUrl } = this.browserUrlManager;

    if (!options.redirectUri) {
      if (!currentUrl) {
        this.logger.error('ClientOptionsValidator', 'options.redirectUri is required to send an authorization request');
        error = true;
      } else {
        this.logger.info('ClientOptionsValidator', 'options.redirectUri not passed in, defaulting to current browser URL', currentUrl);
      }
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.redirectUri verified', options.redirectUri);
    }

    if (error) {
      throw Error('An error occured while validating ClientOptions, see console.error messages for more information');
    }

    const result: ValidatedClientOptions = {
      clientId: options.clientId,
      redirectUri: options.redirectUri || currentUrl,
      grantType: this.getGrantType(options),
      scope: this.getScope(options),
      usePkce: this.getUsePkce(options),
      state: options.state,
      tokenAvailableCallback: options.tokenAvailableCallback,
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
   * Does verification of GrantType sent in through options and sets default of 'code' if not present or invalid
   *
   * @param {ClientOptions} options Options sent into authorize method
   * @returns {string} GrantType that will be used
   */
  private getGrantType(options: ClientOptions): GrantType {
    let { grantType } = options;
    const validResponseTypes = Object.values(GrantType);

    if (!validResponseTypes.includes(grantType)) {
      grantType = GrantType.AuthorizationCode;

      if (options.grantType) {
        this.logger.warn('ClientOptionsValidator', `options.ResponseType contained an invalid option, valid options are '${validResponseTypes.join(', ')}'`, options.grantType);
      } else {
        this.logger.info('ClientOptionsValidator', `options.ResponseType not provided, defaulting to 'code'`);
      }
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.ResponseType passed and valid', options.grantType);
    }

    return grantType;
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
}
