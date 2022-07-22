import { GrantType, TokenOptions } from '../types';
import { Logger } from '../utilities';

export class TokenOptionsValidator {
  private readonly logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }

  // TODO - this needs tests
  /**
   * Validates user passed options and gives nessessary feedback to console/through errors, will also set default values where applicable
   *
   * @param {Token} options Options to be validated
   * @returns {Token} options with applicable default values
   */
  validate(options: TokenOptions): TokenOptions {
    let error = false;
    const result = options;

    if (!options.ClientId) {
      this.logger.error('TokenOptionsValidator', 'options.ClientId is required to get a token');
      error = true;
    }

    if (!options.ClientSecret) {
      this.logger.error('TokenOptionsValidator', 'options.ClientSecret is required to get a token');
      error = true;
    }

    if (options.Code === GrantType.AuthorizationCode) {
      if (!options.Code) {
        this.logger.error('TokenOptionsValidator', 'options.Code is required when grant type is authorization_code');
        error = true;
      }

      if (!options.RedirectUri) {
        this.logger.error('TokenOptionsValidator', 'options.RedirectUri is required when grant type is authorization_code');
        error = true;
      }
    }

    result.GrantType = this.getGrantType(options);

    if (error) {
      throw Error('An error occured while validating TokenOptions, see console.error messages for more information');
    }

    return options;
  }

  private getGrantType(options: TokenOptions): GrantType {
    let grantType = options.GrantType;
    const validGrantTypes = Object.values(GrantType);

    if (!validGrantTypes.includes(grantType)) {
      grantType = GrantType.AuthorizationCode;

      if (options.GrantType) {
        this.logger.warn('AuthZOptionsValidator', `options.GrantType contained an invalid option, valid options are '${validGrantTypes.join(', ')}'`, options.GrantType);
      } else {
        this.logger.info('AuthZOptionsValidator', `options.GrantType not provided, defaulting to 'authorization_code'`);
      }
    } else {
      this.logger.debug('AuthZOptionsValidator', 'options.GrantType passed and valid', options.GrantType);
    }

    return grantType;
  }
}

export default TokenOptionsValidator;
