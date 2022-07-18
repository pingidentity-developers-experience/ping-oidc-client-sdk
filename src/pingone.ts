import { AuthZOptions, InitOptions, ResponseType, TokenOptions } from './types';
import { Logger, Url } from './utilities';
import OAuth from './utilities/oauth';

/**
 * Ping Identity
 * Module representing OIDC endpoints.
 * Implements a library to integrate with PingOne authorization server endpoints.
 * As much as possible, this library will simplify the OIDC protocol flows.
 * For example, the authorization code grant flow requires a get auth code call,
 * then a follow-up call to swap the code for an access/ID token. This is wrapped up
 * in a single get token call because there is no reason to trouble the developer with
 * logic we can infer/presume based on protocol specs and application input.
 *
 * @author Technical Enablement Demo Team, Ping Identity.
 * @version See Github for current stable version. https://github.com/Technical-Enablement-PingIdentity/libraries-sdks
 * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#openid-connectoauth-2
 */

/**
 * // TODO
 * Think like a business apps developer that has to consume OIDC. What would YOU need and expect.
 *  IAM is not their expertise.
 * Design the library as an importable JS module.
 * Thorough JSDoc compliant comments/annotations. We are guiding developers.
 * @see https://jsdoc.app/howto-es2015-modules.html
 * Decisions on how to support less-secure, deprecated grant types. Customers still use them.
 *  console.warn lesser secure usage.
 * Secure coding built in from day one. See OWASP secure coding guidline. We can get guidance
 *
 * from Security team too.
 * Take advantage of destructuring to support default and optional, and named args.
 * Smart, useful deep links to Ping docs. Get them directly to the docs related to the code we
 *
 *  implement.
 *
 */

// JUST DUMPING OUT THOUGHTS AND PSUEDO CODE TO START.

/**
 * // TODO need to think about the design of this module.
 * What's a sensible file name convention. This and the other OIDC JS files are just initial
 * idea. Or
 * maybe we generalize the functions so they would work with any AS.
 * Which module pattern do we implement???
 * Deep diving on the patterns, our best bet is ES6 modules as
 * it gives you "the best of both worlds" of having concepts from both AMD and CommonJS
 * patterns, but
 * moreover it's built into the language. Whereas the former are framework specific conventions.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 * @see https://medium.com/backticks-tildes/introduction-to-es6-modules-49956f580da
 *
 */
// const oidc = () => console.log('developer enablement pingone oidc library');

class PingOneOidc {
  private readonly authzEndpoint = '/as/authorize';
  private readonly tokenEndpoint = '/as/token';
  private readonly pingOneAuthPath;
  private readonly pingOneEnvId;
  private readonly logger;

  constructor(options: InitOptions) {
    this.pingOneAuthPath = Url.ensureTrailingSlash(options.PingOneAuthPath || 'https://auth.pingone.com');
    this.pingOneEnvId = options.PingOneEnvId;
    this.logger = new Logger(options.LoggingLevel);
  }

  /**
   * Request to Authorize endpoing in PingOne
   *
   * options.ClientId - Required
   * options.RedirectUri - Required
   * options.Scope - Optional (defualts to 'openid profile')
   * options.HttpMethod - Optional (defaults to 'GET')
   * options.ResponseType - Optional (defaults to 'code')
   * options.PkceRequest - Optional (defaults to false) - whether to add code challenge and state to url
   * options.CodeChallenge - Optional (no default) - required if pkceEnforcement property is set to S256_REQUIRED in PingOne
   * options.Nonce - Optional (no default) - Nonce token sent with request to prevent replay attacks
   *
   * @param {AuthZOptions} options Options that will be used to generate and send the request
   */
  async authorize(options: AuthZOptions): Promise<any> {
    this.logger.debug(PingOneOidc.name, 'authorize called', options);

    if (!this.pingOneEnvId) {
      const message = 'You must provide a PingOneEnvId through the constructor to authorize';
      this.logger.error(PingOneOidc.name, message);
      throw Error(message);
    }

    if (!options.ClientId) {
      const message = 'options.ClientId is required to get an authorization url from PingOne';
      this.logger.error(PingOneOidc.name, message);
      throw Error(message);
    } else {
      this.logger.debug(PingOneOidc.name, 'options.ClientId verified', options.ClientId);
    }

    if (!options.RedirectUri) {
      const message = 'options.ClientId is required to get an authorization url from PingOne';
      this.logger.error(PingOneOidc.name, message);
      throw Error(message);
    } else {
      this.logger.debug(PingOneOidc.name, 'options.RedirectUri verified', options.RedirectUri);
    }

    const scope = this.getScope(options);
    const authorizeHttpMethod = this.getAuthorizeHttpMethod(options);
    const responseType = this.getResponseType(options);

    if (authorizeHttpMethod === 'GET') {
      const url = `${this.pingOneAuthPath + this.pingOneEnvId}/${this.authzEndpoint}?response_type=${options.ResponseType}&client_id=${options.ClientId}&redirect_uri=${options.RedirectUri}&scope=${
        options.Scope
      }`;

      if (options.ResponseType !== ResponseType.Code && options.PkceRequest) {
        this.logger.warn(PingOneOidc.name, `options.PkceRequest is true but ResponseType is not 'code', PKCE parameters are only supported on authorization_code endpoints`);
      } else if (options.PkceRequest) {
        this.logger.info(PingOneOidc.name, 'options.PkceRequest is true, generating artifacts for request parameters');
        const pkceArtifacts = await OAuth.generatePkceArtifacts(options, this.logger);
        url.concat(`&state=${pkceArtifacts.State}&code_challenge=${pkceArtifacts.CodeChallenge}`);

        if (pkceArtifacts.CodeChallengeMethod) {
          url.concat(`&code_challenge_method=${pkceArtifacts.CodeChallengeMethod}`);
          this.logger.debug(PingOneOidc.name, 'options.CodeChallengeMethod was applied to url', pkceArtifacts.CodeChallengeMethod);
        }

        sessionStorage.set('state', pkceArtifacts.State);
        sessionStorage.set('code_verifier', pkceArtifacts.CodeVerifier);
      }

      this.logger.debug(PingOneOidc.name, 'authorize URL generated, your browser will now navigate to it', url);
      window.location.assign(url);
    } else {
      const url = `${this.pingOneAuthPath + this.pingOneEnvId}/${this.authzEndpoint}`;

      const headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');

      const body = new URLSearchParams();
      body.append('response_type', responseType);
      body.append('client_id', options.ClientId);
      body.append('redirect_uri', options.RedirectUri);
      body.append('scope', scope);

      const request: RequestInit = {
        method: authorizeHttpMethod,
        redirect: 'manual',
        headers,
        body,
      };

      this.logger.debug(PingOneOidc.name, 'Authorize POST url', url);
      this.logger.debug(PingOneOidc.name, 'Authorize POST request', request);

      const response = await fetch(url, request);
      await response.json();
    }
  }

  token(options: TokenOptions) {
    this.logger.debug(PingOneOidc.name, 'token called', options);

    if (!this.pingOneAuthPath || !this.pingOneEnvId) {
      this.logger.error(PingOneOidc.name, 'You must provide a PingOneEnvId through the constructor before you can get a token');
    }
  }

  /**
   * Does verification of HttpMethod sent in through options and sets a default of 'GET' if not present or invalid
   *
   * @param {AuthZOptions} options Options sent into authorize method
   * @returns {string} HttpMethod that will be used
   */
  private getAuthorizeHttpMethod(options: AuthZOptions): string {
    let method = options.HttpMethod;
    if (method !== 'GET' && method !== 'POST') {
      method = 'GET';

      if (options.HttpMethod) {
        this.logger.warn(PingOneOidc.name, 'options.HttpMethod contained an invalid option, valid options are GET and POST', options.HttpMethod);
      } else {
        this.logger.info(PingOneOidc.name, `options.HttpMethod not provided, defaulting to 'GET'`);
      }
    } else {
      this.logger.debug(PingOneOidc.name, 'options.HttpMethod passed and valid', options.HttpMethod);
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
        this.logger.warn(PingOneOidc.name, `options.ResponseType contained an invalid option, valid options are '${validResponseTypes.join(', ')}'`, options.ResponseType);
      } else {
        this.logger.info(PingOneOidc.name, `options.ResponseType not provided, defaulting to 'code'`);
      }
    } else {
      this.logger.debug(PingOneOidc.name, 'options.ResponseType passed and valid', options.ResponseType);
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
      this.logger.info(PingOneOidc.name, `options.Scope not provided, defaulting to '${defaultScope}'`);
    } else {
      this.logger.debug(PingOneOidc.name, 'options.Scope passed', options.Scope);
    }

    return options.Scope || defaultScope;
  }
}

export default PingOneOidc;
