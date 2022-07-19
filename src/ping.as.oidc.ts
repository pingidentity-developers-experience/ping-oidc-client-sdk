/**
 * Ping Identity
 * Library representing OIDC and OAuth endpoints.
 * Implements a library to integrate with PingFederate authorization server endpoints.
 * As much as possible, this library will simplify the OAuth/OIDC protocol flows.
 * For example, the authorization code grant flow requires a get auth code call,
 * then a follow-up call to swap the code for an access token. This can be wrapped up
 * in a single get token call because there is no reason to trouble the developer with
 * logic we can infer/presume based on protocol specs and application input.
 *
 * @author Technical Enablement Demo Team, Ping Identity.
 * @version 0.1.0
 * @see https://docs.pingidentity.com/bundle/pingfederate-110/page/qom1564002958524.html
 * @see https://docs.pingidentity.com/bundle/pingfederate-110/page/lhk1564003024628.html
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-regext-rdap-openid
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-01
 * @see https://datatracker.ietf.org/doc/html/rfc6749
 */
import { AsInitOptions, AuthZOptions, ResponseType } from './types';
import { Logger } from './utilities';
import OAuth from './utilities/oauth';

/**
 * * This OIDC module wraps the OAuth module. OAuth does not require OIDC and can be used independently.
 * So why import OIDC specifics if they are not used. OIDC module just inherits OAuth for more flexible design.
 * @module PingAsOidc
 * @param {string} oidcConfig The required OAuth params in JSON format.
 */

class PingAsOidc {
  /** These are static and private because they are defined by
  the OIDC spec and implemented by PingFederate. * */
  private readonly authzEndpoint = '/as/authorization.oauth2';
  private readonly tokenEndpoint = '/as/token.oauth2';
  /** Other OAuth endpoints are defined in ping.as.oauth.
  private readonly wellKnownEndpointURI = '/.well-known/openid-configuration';
  private readonly introspectEndpointURI = '/as/introspect.oauth2';
  private readonly tokenRevocationEndpointURI = '/as/revoke_token.oauth2';
  private readonly userInfoEndpointURI = '/idp/userinfo.openid';
  private readonly cibaEndpointURI = '/as/bc-auth.ciba';
  private readonly grantsMgmtEndpointURI = '/as/oauth_access_grants.ping';
  private readonly dynamicClientRegEndpointURI = '/as/clients.oauth2';
  private readonly deviceAuthzEndpointURI = '/as/device_authz.oauth2';
  private readonly userAuthzEndpointURI = '/as/user_authz.oauth2';
  private readonly pushedAuthzEndpointURI = '/as/par.oauth2';* */
  private readonly logger;
  private readonly options;

  /**
  Class Constructor
  @param {object} configs Path to your PingFederate runtime engine nodes.
  */
  constructor(options: AsInitOptions) {
    this.options = options;
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
   * options.CodeChallengeMethod - Optional (no default) - required if pkceEnforcement property is set to S256_REQUIRED in PingOne
   * options.Nonce - Optional (no default) - Nonce token sent with request to prevent replay attacks
   *
   * @param {AuthZOptions} options Options that will be used to generate and send the request
   */
  async authorize(options: AuthZOptions): Promise<any> {
    this.logger.debug(PingAsOidc.name, 'authorize called', options);

    if (!options.ClientId) {
      const message = 'options.ClientId is required to get an authorization url from PingFederate';
      this.logger.error(PingAsOidc.name, message);
      throw Error(message);
    } else {
      this.logger.debug(PingAsOidc.name, 'options.ClientId verified', options.ClientId);
    }

    if (!options.RedirectUri) {
      const message = 'options.ClientId is required to get an authorization url from PingFederate';
      this.logger.error(PingAsOidc.name, message);
      throw Error(message);
    } else {
      this.logger.debug(PingAsOidc.name, 'options.RedirectUri verified', options.RedirectUri);
    }

    const scope = this.getScope(options);
    const authorizeHttpMethod = this.getAuthorizeHttpMethod(options);
    const responseType = this.getResponseType(options);

    if (authorizeHttpMethod === 'GET') {
      let url = `${this.options.BasePath}${this.authzEndpoint}?response_type=${options.ResponseType}&client_id=${options.ClientId}&redirect_uri=${options.RedirectUri}&scope=${options.Scope}`;

      if (options.ResponseType !== ResponseType.Code && options.PkceRequest) {
        this.logger.warn(PingAsOidc.name, `options.PkceRequest is true but ResponseType is not 'code', PKCE parameters are only supported on authorization_code endpoints`);
      } else if (options.PkceRequest) {
        this.logger.info(PingAsOidc.name, 'options.PkceRequest is true, generating artifacts for request parameters');
        const pkceArtifacts = await OAuth.generatePkceArtifacts(options, this.logger);
        url = url.concat(`&state=${pkceArtifacts.State}&code_challenge=${pkceArtifacts.CodeChallenge}`);

        if (pkceArtifacts.CodeChallengeMethod) {
          url = url.concat(`&code_challenge_method=${pkceArtifacts.CodeChallengeMethod}`);
          this.logger.debug(PingAsOidc.name, 'options.CodeChallengeMethod was applied to url', pkceArtifacts.CodeChallengeMethod);
        }

        sessionStorage.setItem('state', pkceArtifacts.State);
        sessionStorage.setItem('code_verifier', pkceArtifacts.CodeVerifier);
      }

      this.logger.debug(PingAsOidc.name, 'authorize URL generated, your browser will now navigate to it', url);

      return url;
      // window.location.assign(url);
    }
    const url = `${this.options.BasePath}${this.authzEndpoint}`;

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

    this.logger.debug(PingAsOidc.name, 'Authorize POST url', url);
    this.logger.debug(PingAsOidc.name, 'Authorize POST request', request);

    const response = await fetch(url, request);
    await response.json();

    return '';
  }

  /**
  OAuth Token:
  Swaps an OAuth code for an OAuth access token.
  @see https://docs.pingidentity.com/bundle/pingfederate-103/page/xhx1564003025004.html
  @param {string} code Authorization code from AS.
  @param {string} redirectURI App URL user should be redirected to after swap for token.
  @param {string} clientId client ID for the OAuth client being used.
  @param {string} clientSecret client secret for the OAuth client being used.
  @returns {object} JSON formatted response object.
  */
  async getToken(code: string, redirectURI: string, clientID: string, clientSecret: string) {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Basic ${btoa(`${clientID}:${clientSecret}`)}`);
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'authorization_code');
    urlencoded.append('code', code);
    urlencoded.append('redirect_uri', redirectURI);
    urlencoded.append('code_verifier', sessionStorage.getItem('code_verifier'));

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'manual',
    };

    const url = this.options.BasePath + this.tokenEndpoint;
    const response = await fetch(url, requestOptions);
    const jsonResponse = await response.json();
    return jsonResponse;
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
        this.logger.warn(PingAsOidc.name, 'options.HttpMethod contained an invalid option, valid options are GET and POST', options.HttpMethod);
      } else {
        this.logger.info(PingAsOidc.name, `options.HttpMethod not provided, defaulting to 'GET'`);
      }
    } else {
      this.logger.debug(PingAsOidc.name, 'options.HttpMethod passed and valid', options.HttpMethod);
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
        this.logger.warn(PingAsOidc.name, `options.ResponseType contained an invalid option, valid options are '${validResponseTypes.join(', ')}'`, options.ResponseType);
      } else {
        this.logger.info(PingAsOidc.name, `options.ResponseType not provided, defaulting to 'code'`);
      }
    } else {
      this.logger.debug(PingAsOidc.name, 'options.ResponseType passed and valid', options.ResponseType);
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
      this.logger.info(PingAsOidc.name, `options.Scope not provided, defaulting to '${defaultScope}'`);
    } else {
      this.logger.debug(PingAsOidc.name, 'options.Scope passed', options.Scope);
    }

    return options.Scope || defaultScope;
  }
}

export default PingAsOidc;
