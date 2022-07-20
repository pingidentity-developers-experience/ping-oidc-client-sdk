import { AuthZOptionsValidator, PingOneInitOptionsValidator } from './validators';
import { AuthZOptions, PingOneInitOptions, ResponseType, TokenOptions } from './types';
import { Logger, Url } from './utilities';
import OAuth from './utilities/oauth';
import TokenOptionsValidator from './validators/token-options-validator';

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
  private readonly defaultAuthPath = 'https://auth.pingone.com';
  private readonly authzEndpoint = '/as/authorize';
  private readonly tokenEndpoint = '/as/token';
  private readonly pingOneAuthPath;
  private readonly pingOneEnvId;
  private readonly logger;

  constructor(options: PingOneInitOptions) {
    this.logger = new Logger(options.LoggingLevel);

    const validatedOptions = new PingOneInitOptionsValidator(this.logger).validate(options);

    this.pingOneAuthPath = Url.trimTrailingSlash(validatedOptions.PingOneAuthPath || this.defaultAuthPath);
    this.pingOneEnvId = validatedOptions.PingOneEnvId;
  }

  /**
   * Request to Authorize endpoint in PingOne
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
  async authorize(inputOptions: AuthZOptions): Promise<string> {
    this.logger.debug('PingOneOidc', 'authorize called', inputOptions);

    const validatedOptions = new AuthZOptionsValidator(this.logger).validate(inputOptions);

    let url = this.pingOneAuthPath === this.defaultAuthPath ? `${this.pingOneAuthPath}/${this.pingOneEnvId}` : this.pingOneAuthPath;

    if (validatedOptions.HttpMethod === 'GET') {
      url += `${this.authzEndpoint}?response_type=${validatedOptions.ResponseType}&client_id=${validatedOptions.ClientId}&redirect_uri=${validatedOptions.RedirectUri}&scope=${validatedOptions.Scope}`;

      if (validatedOptions.ResponseType !== ResponseType.Code && validatedOptions.PkceRequest) {
        this.logger.warn('PingOneOidc', `options.PkceRequest is true but ResponseType is not 'code', PKCE parameters are only supported on authorization_code endpoints`);
      } else if (validatedOptions.PkceRequest) {
        this.logger.info('PingOneOidc', 'options.PkceRequest is true, generating artifacts for request parameters');
        const pkceArtifacts = await OAuth.generatePkceArtifacts(validatedOptions, this.logger);
        url.concat(`&state=${pkceArtifacts.State}&code_challenge=${pkceArtifacts.CodeChallenge}`);

        if (pkceArtifacts.CodeChallengeMethod) {
          url.concat(`&code_challenge_method=${pkceArtifacts.CodeChallengeMethod}`);
          this.logger.debug('PingOneOidc', 'options.CodeChallengeMethod was applied to url', pkceArtifacts.CodeChallengeMethod);
        }

        sessionStorage.setItem('state', pkceArtifacts.State);
        sessionStorage.setItem('code_verifier', pkceArtifacts.CodeVerifier);
      }

      this.logger.debug('PingOneOidc', 'authorize URL generated', url);

      return url;
      // window.location.assign(url);
    }

    return '';
    // TODO - future iteration
    /* else {
      url += `${this.authzEndpoint}`;

      const headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');

      const body = new URLSearchParams();
      body.append('response_type', validatedOptions.ResponseType);
      body.append('client_id', validatedOptions.ClientId);
      body.append('redirect_uri', validatedOptions.RedirectUri);
      body.append('scope', validatedOptions.Scope);

      const request: RequestInit = {
        method: validatedOptions.HttpMethod,
        redirect: 'manual',
        headers,
        body,
      };

      this.logger.debug('PingOneOidc', 'Authorize POST url', url);
      this.logger.debug('PingOneOidc', 'Authorize POST request', request);

      const response = await fetch(url, request);
      const json = await response.json();

      this.logger.info('PingOneOidc')

      this.logger.info('PingOneOidc', 'JSON RESPONSE', json);
    } */
  }

  /**
   * Request to Token endpoint in PingOne, swaps OAuth code for an OAuth access token
   *
   * options.Code - Required
   * options.RedirectUri - Required
   * options.GrantType - Optional (defaults to authorization_code)
   *
   * @param options Options that will be used to generate and send the request
   */
  async getToken(inputOptions: TokenOptions) {
    this.logger.debug('PingOneOidc', 'authorize called', inputOptions);

    const validatedOptions = new TokenOptionsValidator(this.logger).validate(inputOptions);

    const headers = new Headers();
    headers.append('Authorization', `Basic ${window.btoa(`${validatedOptions.ClientId}:${validatedOptions.ClientSecret}`)}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.append('grant_type', inputOptions.GrantType);
    body.append('code', validatedOptions.Code);
    body.append('redirect_uri', validatedOptions.RedirectUri);
    body.append('code_verifier', sessionStorage.getItem('code_verifier'));

    const request: RequestInit = {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
    };

    const url = this.pingOneAuthPath + this.tokenEndpoint;

    this.logger.debug('PingOneOidc', 'Authorize POST url', url);
    this.logger.debug('PingOneOidc', 'Authorize POST request', request);

    const response = await fetch(url, request);
    return response.json();
  }
}

export default PingOneOidc;
