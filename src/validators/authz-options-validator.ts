import { AuthZOptions, ResponseType } from '../types';
import { Logger } from '../utilities';

export class AuthZOptionsValidator {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Validates user passed options and gives nessessary feedback to console/through errors, will also set default values where applicable
   *
   * @param {AuthZOptions} options Options to be validated
   * @returns {AuthZOptions} options with applicable default values
   */
  validate(options: AuthZOptions): AuthZOptions {
    let error = false;
    const result = options;

    if (!options.ClientId) {
      this.logger.error('AuthZOptionsValidator', 'options.ClientId is required to send an authorization request');
      error = true;
    } else {
      this.logger.debug('AuthZOptionsValidator', 'options.ClientId verified', options.ClientId);
    }

    if (!options.RedirectUri) {
      this.logger.error('AuthZOptionsValidator', 'options.RedirectUri is required to send an authorization request');
      error = true;
    } else {
      this.logger.debug('AuthZOptionsValidator', 'options.RedirectUri verified', options.RedirectUri);
    }

    result.HttpMethod = this.getAuthorizeHttpMethod(options);
    result.ResponseType = this.getResponseType(options);
    result.Scope = this.getScope(options);

    if (error) {
      throw Error('An error occured while validating AuthZOptions, see console.error messages for more information');
    }

    return result;
  }

  /**
   * Does verification of HttpMethod sent in through options and sets a default of 'GET' if not present or invalid
   *
   * @param {AuthZOptions} options Options sent into authorize method
   * @returns {string} HttpMethod that will be used
   */
  private getAuthorizeHttpMethod(options: AuthZOptions): 'GET' | 'POST' {
    let method = options.HttpMethod;
    if (method !== 'GET' && method !== 'POST') {
      method = 'GET';

      if (options.HttpMethod) {
        this.logger.warn('AuthZOptionsValidator', 'options.HttpMethod contained an invalid option, valid options are GET and POST', options.HttpMethod);
      } else {
        this.logger.info('AuthZOptionsValidator', `options.HttpMethod not provided, defaulting to 'GET'`);
      }
    } else {
      this.logger.debug('AuthZOptionsValidator', 'options.HttpMethod passed and valid', options.HttpMethod);
    }

    return method;
  }

  /**
   * Does verification of ResponseType sent in through options and sets default of 'code' if not present or invalid
   *
   * @param {AuthZOptions} options Options sent into authorize method
   * @returns {string} ResponseType that will be used
   */
  private getResponseType(options: AuthZOptions): ResponseType {
    let authZType = options.ResponseType;
    const validResponseTypes = Object.values(ResponseType);

    if (!validResponseTypes.includes(authZType)) {
      authZType = ResponseType.Code;

      if (options.ResponseType) {
        this.logger.warn('AuthZOptionsValidator', `options.ResponseType contained an invalid option, valid options are '${validResponseTypes.join(', ')}'`, options.ResponseType);
      } else {
        this.logger.info('AuthZOptionsValidator', `options.ResponseType not provided, defaulting to 'code'`);
      }
    } else {
      this.logger.debug('AuthZOptionsValidator', 'options.ResponseType passed and valid', options.ResponseType);
    }

    return authZType;
  }

  /**
   * Does verification of Scope sent in through options and sets default of 'openid profile' if not present or invalid
   *
   * @param {AuthZOptions} options Options sent into authorize method
   * @returns {string} Scope that will be passed to PingOne endpoint
   */
  private getScope(options: AuthZOptions): string {
    const defaultScope = 'openid profile';

    if (!options.Scope) {
      this.logger.info('AuthZOptionsValidator', `options.Scope not provided, defaulting to '${defaultScope}'`);
    } else {
      this.logger.debug('AuthZOptionsValidator', 'options.Scope passed', options.Scope);
    }

    return options.Scope || defaultScope;
  }
}

export default AuthZOptionsValidator;
