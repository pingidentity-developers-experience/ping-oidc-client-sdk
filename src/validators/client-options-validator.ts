import { ClientOptions, ClientSecretAuthMethod, ValidatedClientOptions } from '../types';
import GrantType from '../types/grant-type';
import { Logger } from '../utilities';

export class ClientOptionsValidator {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
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

    if (!options.redirectUri) {
      this.logger.error('ClientOptionsValidator', 'options.redirectUri is required to send an authorization request');
      error = true;
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.redirectUri verified', options.redirectUri);
    }

    if (error) {
      throw Error('An error occured while validating ClientOptions, see console.error messages for more information');
    }

    const result: ValidatedClientOptions = {
      clientId: options.clientId,
      redirectUri: options.redirectUri,
      grantType: this.getGrantType(options),
      scope: this.getScope(options),
      usePkce: this.getUsePkce(options),
      clientSecret: options.clientSecret,
      state: options.state,
      tokenAvailableCallback: options.tokenAvailableCallback,
    };

    if (result.grantType === GrantType.AuthorizationCode) {
      if (!result.usePkce && !result.clientSecret) {
        throw Error('You are trying to authenticate using a code without PKCE but did not provide a clientSecret, you will not be able to get a token');
      } else if (options.clientSecretAuthMethod || result.clientSecret) {
        if (result.usePkce) {
          this.logger.warn(
            'ClientOptionsValidator',
            'You have passed a clientSecret and/or clientSecretAuthMethod but are also using PKCE, it is not recommended to use client secret authentication and PKCE',
          );
        }

        if (!result.clientSecret) {
          this.logger.warn('ClientOptionsValidator', 'You passed a clientSecretAuthMethod but no client secret, it will be ignored');
        } else {
          result.clientSecretAuthMethod = this.getClientSecretAuthMethod(options);
        }
      }
    }

    // If window is undefined we are in a node app and it's fine
    if (result.clientSecret && window !== undefined) {
      // Don't want to block people from doing this, but do want to warn them
      this.logger.warn('ClientOptionsValidator', 'It is not recommended to use code grants without PKCE in browser applications, consider using PKCE and removing the client secret from your code');
    }

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
   * Does verification of ClientSecretAuthMethod sent in through options and sets default of 'client_secret_basic' if not present or invalid
   *
   * @param {ClientOptions} options Options sent into authorize method
   * @returns {string} ClientSecretAuthMethod that will be used
   */
  private getClientSecretAuthMethod(options: ClientOptions): ClientSecretAuthMethod {
    let { clientSecretAuthMethod } = options;
    const validResponseTypes = Object.values(ClientSecretAuthMethod);

    if (!validResponseTypes.includes(clientSecretAuthMethod)) {
      clientSecretAuthMethod = ClientSecretAuthMethod.Basic;

      if (options.clientSecretAuthMethod) {
        this.logger.warn('ClientOptionsValidator', `options.clientSecretAuthMethod contained an invalid option, valid options are '${validResponseTypes.join(', ')}'`, options.clientSecretAuthMethod);
      } else {
        this.logger.info('ClientOptionsValidator', `options.clientSecretAuthMethod not provided, defaulting to 'client_secret_basic'`);
      }
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.clientSecretAuthMethod passed and valid', options.clientSecretAuthMethod);
    }

    return clientSecretAuthMethod;
  }

  /**
   * Does verification of Scope sent in through options and sets default of 'openid profile' if not present or invalid
   *
   * @param {ClientOptions} options Options sent into authorize method
   * @returns {string} Scope that will be passed to PingOne endpoint
   */
  private getScope(options: ClientOptions): string {
    const defaultScope = 'openid profile';

    if (!options.scope) {
      this.logger.info('ClientOptionsValidator', `options.Scope not provided, defaulting to '${defaultScope}'`);
    } else {
      this.logger.debug('ClientOptionsValidator', 'options.Scope passed', options.scope);
    }

    return options.scope || defaultScope;
  }
}

export default ClientOptionsValidator;
