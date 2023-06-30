/* eslint-disable camelcase */
/**
 * OAuth/OIDC SDK
 * Ping Identity
 * @author Technical Enablement Demo Team
 * @description The main entry point for your application's integration.
 */

import { ClientOptions, ResponseType, OpenIdConfiguration, TokenResponse, ValidatedClientOptions } from './types';
import { Logger, OAuth, ClientStorage, Url, BrowserUrlManager } from './utilities';
import { LocalClientStorage } from './utilities/local-store';
import { SessionClientStorage } from './utilities/session-store';
import { WorkerClientStorage } from './utilities/worker-store';
import { ClientOptionsValidator } from './validators';

/**
 * Class representing the OIDC client. The main interface to the SDK.
 */
export class OidcClient {
  private readonly clientOptions: ValidatedClientOptions;
  private readonly issuerConfiguration: OpenIdConfiguration;
  private readonly logger: Logger;
  private readonly clientStorage: ClientStorage;
  private readonly browserUrlManager: BrowserUrlManager;

  /**
   * It is recommended to initialize this class using the initializeFromOpenIdConfig method which allows the open id configuration to be built
   * from your issuer's well-known endpoint. However if you wish, you can initialize the OidcClient class manually passing
   * in the OpenIdConfiguration manually.
   *
   * @param clientOptions {ClientOptions} Options for the OIDC Client, client_id is required
   * @param issuerConfig {OpenIdConfiguration} OpenIdConfiguration object that the library will use
   */
  constructor(clientOptions: ClientOptions, issuerConfig: OpenIdConfiguration) {
    this.logger = new Logger(clientOptions?.logLevel);

    if (!clientOptions || !issuerConfig) {
      throw Error('clientOptions and issuerConfig are required to initialize an OidcClient');
    }

    switch (clientOptions?.storageType) {
      case 'local':
        this.logger.info('OidcClient', 'option for storageType was local, using localStorage');
        this.clientStorage = new LocalClientStorage();
        break;
      case 'session':
        this.logger.info('OidcClient', 'option for storageType was session, using sessionStorage');
        this.clientStorage = new SessionClientStorage();
        break;
      case 'worker':
        if (window.Worker) {
          this.clientStorage = new WorkerClientStorage();
          break;
        } else {
          this.logger.warn('OidcClient', 'could not initialize a Web Worker, ensure your browser supports them, localStorage will be used instead');
          this.clientStorage = new LocalClientStorage();
          break;
        }
      default:
        this.logger.info('OidcClient', 'option for storageType was not passed, defaulting to localStorage');
        this.clientStorage = new LocalClientStorage();
        break;
    }

    this.browserUrlManager = new BrowserUrlManager(this.logger);

    // TODO - validator for issuerConfig?
    this.issuerConfiguration = issuerConfig;
    this.clientOptions = new ClientOptionsValidator(this.logger, this.browserUrlManager).validate(clientOptions);

    this.logger.debug('OidcClient', 'initialized with issuerConfig', issuerConfig);
  }

  /**
   * Whether there is a token managed by the library available
   */
  async hasToken(): Promise<boolean> {
    console.log('has token?', !!(await this.clientStorage.getToken())?.access_token);
    return !!(await this.clientStorage.getToken())?.access_token;
  }

  /**
   * Asynchronous wrapper around the constructor that allows apps to wait for a potential token
   * to be extracted/retrieved when initializing an OidcClient object.
   *
   * @param clientOptions {ClientOptions} Options for the OIDC Client, client_id is required
   * @param issuerConfig {OpenIdConfiguration} OpenIdConfiguration object that the library will use
   * @returns {Promise<OidcClient>} Promise that will resolve with an OidcClient
   */
  static async initializeClient(clientOptions: ClientOptions, issuerConfig: OpenIdConfiguration): Promise<OidcClient> {
    const client = new OidcClient(clientOptions, issuerConfig);

    if ((await client.hasToken()) || client.browserUrlManager.tokenReady) {
      await client.getToken();
    }

    return client;
  }

  /**
   * Creates the client-options object for you using the metadata from your authorization servers well-known endpoint.
   *
   * @param issuerUrl {string} Base URL for the issuer, /.well-known/openid-configuration will be appended in this method
   * @param clientOptions {ClientOptions} Options for the OIDC Client, client_id is required
   * @returns {object}
   * @see https://www.rfc-editor.org/rfc/rfc8414.html#section-3
   * @see https://openid.net/specs/openid-connect-discovery-1_0.html#IssuerDiscovery
   */
  static async initializeFromOpenIdConfig(issuerUrl: string, clientOptions: ClientOptions): Promise<OidcClient> {
    if (typeof issuerUrl !== 'string' || !Url.isValidUrl(issuerUrl)) {
      return Promise.reject(new Error(`Error creating an OpenIdClient please ensure you have entered a valid url ${issuerUrl}`));
    }

    try {
      const wellKnownResponse = await fetch(`${Url.trimTrailingSlash(issuerUrl)}/.well-known/openid-configuration`);
      const responseBody = await wellKnownResponse.json();

      return await OidcClient.initializeClient(clientOptions, responseBody);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Takes an optional login_hint and navigates the browser to the generated authorize endpoint using window.location.assign
   *
   * @param loginHint {string} login_hint url parameter that will be appended to URL in case you have a username/email already
   * @returns {Promise} Will navigate the current browser tab to the authorization url that is generated through the authorizeUrl method
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-3.1
   */
  async authorize(loginHint?: string, silentAuthN?: boolean): Promise<void> {
    try {
      const authUrl = await this.authorizeUrl(loginHint, silentAuthN);
      this.browserUrlManager.navigate(authUrl);
    } catch (error) {
      return Promise.reject(error);
    }

    return Promise.resolve();
  }

  /**
   * Takes an optional login_hint and returns a Promise containing the url you will redirect the user to.
   * Typically you will want to apply the url to an anchor tag or redirect to it using window.location.assign(xxx).
   *
   * @param loginHint {string} login_hint url parameter that will be appended to URL in case you have a username/email already
   * @param silentAuthN {boolean} If true, silent authentication is initiated
   * @returns {Promise<string>} Promise that will resolve with a url you should redirect to
   * @see https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4
   */
  async authorizeUrl(loginHint?: string, silentAuthN?: boolean): Promise<string> {
    this.logger.debug('OidcClient', 'authorized called');

    if (!this.issuerConfiguration?.authorization_endpoint) {
      return Promise.reject(
        Error(
          `No authorization_endpoint has not been found, either initialize the client with OidcClient.initializeFromOpenIdConfig() using an issuer with a .well-known endpoint or ensure you have passed in a authorization_endpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    const urlParams = new URLSearchParams();
    urlParams.append('response_type', this.clientOptions.response_type);
    urlParams.append('client_id', this.clientOptions.client_id);
    urlParams.append('redirect_uri', this.clientOptions.redirect_uri);
    urlParams.append('scope', this.clientOptions.scope);

    if (this.clientOptions.response_type === ResponseType.AuthorizationCode) {
      const pkceArtifacts = await OAuth.generatePkceArtifacts(this.clientOptions, this.logger);
      urlParams.append('state', pkceArtifacts.state);
      urlParams.append('nonce', pkceArtifacts.nonce);

      if (this.clientOptions.usePkce) {
        console.log('Have codeVerifier', pkceArtifacts.codeVerifier);
        urlParams.append('code_challenge', pkceArtifacts.codeChallenge);
        // Basic is not recommended, just use S256
        urlParams.append('code_challenge_method', 'S256');
        this.clientStorage.storeCodeVerifier(pkceArtifacts.codeVerifier);
      }
    }

    if (loginHint) {
      urlParams.append('login_hint', encodeURIComponent(loginHint));
    }

    if (silentAuthN) {
      urlParams.append('prompt', 'none');
    }

    return Promise.resolve(`${this.issuerConfiguration?.authorization_endpoint}?${urlParams.toString()}`);
  }

  /**
   * Get a token. It will check for tokens in the following order:
   *
   * 1. Previously stored token
   * 2. Token from the URL Hash (implicit)
   * 3. Token from the authorization server (authorization_code, grant_type: 'authorization_code' or default)
   *
   * Getting a token from the authorization server requires a 'code' url parameter or manually passing in the code if you'd like to manage it yourself.
   * Please note if the token or code is retrieved from the url it will automatically be removed from the URL and browser history after the library has
   * a token.
   *
   * @returns Token response from auth server
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.2
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1
   */
  async getToken(): Promise<TokenResponse> {
    this.logger.debug('OidcClient', 'getToken called');

    // Clear lingering token from storage if a new one is ready.
    if (this.browserUrlManager.tokenReady) {
      this.clientStorage.removeToken();
    }

    let token = await this.clientStorage.getToken();

    if (token) {
      return token;
    }

    if (!this.issuerConfiguration?.token_endpoint) {
      return Promise.reject(
        Error(
          `No token_endpoint has not been found, either initialize the client with OidcClient.initializeFromOpenIdConfig() using an issuer with a .well-known endpoint or ensure you have passed in a token_endpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    token = this.browserUrlManager.checkUrlForToken();

    if (!token) {
      const code = this.browserUrlManager.checkUrlForCode();

      if (!code) {
        return Promise.reject(Error('An authorization code was not found and a token was not found in storage or the url'));
      }

      const body = new URLSearchParams();
      // grant_type will be omitted if implicit grant
      body.append('grant_type', this.clientOptions.response_type === ResponseType.Token ? '' : 'authorization_code');
      body.append('code', code);
      body.append('redirect_uri', this.clientOptions.redirect_uri);

      if (this.clientOptions.response_type === ResponseType.AuthorizationCode) {
        if (this.clientOptions.usePkce) {
          // PKCE uses a code_verifier from client
          const codeVerifier = await this.clientStorage.getCodeVerifier();

          if (!codeVerifier) {
            throw Error('usePkce is true but a code verifier was not found in localStorage');
          }

          body.append('code_verifier', codeVerifier);
        }
      }

      try {
        token = await this.authenticationServerApiCall<TokenResponse>(this.issuerConfiguration.token_endpoint, body);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    token.state = this.browserUrlManager.checkUrlForState();

    this.clientStorage.storeToken(token);

    return Promise.resolve(token);
  }

  /**
   * Revoke the token managed by the library
   *
   * @returns {any} - HTTP response 200 only.
   * @see https://www.rfc-editor.org/rfc/rfc7009#section-2
   */
  async revokeToken(): Promise<any> {
    this.logger.debug('OidcClient', 'revokeToken called');

    const token = await this.verifyToken();

    if (!token) {
      return Promise.reject(Error('No token available'));
    }

    if (!this.issuerConfiguration?.revocation_endpoint) {
      return Promise.reject(
        Error(
          `No revocation_endpoint has been found, either initialize the client with OidcClient.initializeFromOpenIdConfig() using an issuer with a .well-known endpoint or ensure you have passed in a userinfo_endpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    const body = new URLSearchParams();
    body.append('token', token.access_token);
    body.append('token_type_hint', 'access_token');

    try {
      const revokeResponse = await this.authenticationServerApiCall(this.issuerConfiguration.revocation_endpoint, body);
      this.clientStorage.removeToken();
      return revokeResponse;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Get a new access token using refresh token.
   *
   * @returns Token response from auth server
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-6
   */

  async refreshToken(): Promise<TokenResponse | void> {
    this.logger.debug('OidcClient', 'refreshToken called');

    const refreshToken = await this.clientStorage.getRefreshToken();
    this.clientStorage.removeToken();

    if (refreshToken) {
      this.logger.info('OidcClient', 'refreshToken found in storage, using that to get a new access token.');

      const body = new URLSearchParams();
      body.append('grant_type', 'refresh_token');
      body.append('refresh_token', refreshToken);

      try {
        const token = await this.authenticationServerApiCall<TokenResponse>(this.issuerConfiguration.token_endpoint, body);
        this.clientStorage.storeToken(token);
        return Promise.resolve(token);
      } catch {
        this.logger.error('OidcClient', 'Refresh token is invalid or expired, attempting a silent authentication request.');
      }
    } else {
      this.logger.warn('OidcClient', 'No refresh token found, the Authentication Server may not support refresh tokens, attempting a silent authentication request.');
    }

    return this.authorize(undefined, true);
  }

  /**
   * End the users session using the end_session_endpoint from the issuer, the id token will be automatically appended
   * to the url via the id_token_hint url parameter if it is available. This call will redirect the browser tab to the signoff
   * endpoint so it does not return anything.
   *
   * @param postLogoutRedirectUri {string} optional url to redirect user to after their session has been ended
   */
  async endSession(postLogoutRedirectUri?: string): Promise<void> {
    this.logger.debug('OidcClient', 'endSession called');

    if (!this.issuerConfiguration?.end_session_endpoint) {
      this.logger.error(
        'OidcClient',
        'No end_session_endpoint has not been found, either initialize the client with OidcClient.initializeFromOpenIdConfig() using an issuer with a .well-known endpoint or ensure you have passed in a end_session_endpoint with the OpenIdConfiguration object',
      );
      return;
    }

    let logoutUrl = this.issuerConfiguration.end_session_endpoint;
    const search = new URLSearchParams();

    const token = await this.clientStorage.getToken();

    if (token?.id_token) {
      this.logger.info('OidcClient', 'id_token found, appending id_token_hint the end session url');
      search.append('id_token_hint', token.id_token);
    }

    if (postLogoutRedirectUri) {
      this.logger.debug('OidcClient', 'postLogoutRedirectUri passed in, appending post_logout_redirect_uri to end session url', postLogoutRedirectUri);
      search.append('post_logout_redirect_uri', postLogoutRedirectUri);
    }

    const params = search.toString();
    logoutUrl += params ? `?${params}` : '';

    this.clientStorage.removeToken();
    this.browserUrlManager.navigate(logoutUrl);
  }

  /**
   * Retrieve the User Info from the issuer, uses OpenIdConfiguration from the server and the token managed by the library
   *
   * @returns {any} User Info returned from the issuer
   * @see https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
   */
  async fetchUserInfo<T>(): Promise<T> {
    this.logger.debug('OidcClient', 'fetchUserInfo called');

    const token = await this.verifyToken();

    if (!token) {
      return Promise.reject(Error('No token available'));
    }

    if (!this.issuerConfiguration?.userinfo_endpoint) {
      return Promise.reject(
        Error(
          `No userinfo_endpoint has not been found, either initialize the client with OidcClient.initializeFromOpenIdConfig() using an issuer with a .well-known endpoint or ensure you have passed in a userinfo_endpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token.access_token}`);

    const request: RequestInit = {
      method: 'GET',
      headers,
    };

    let response;
    let body;

    try {
      response = await fetch(this.issuerConfiguration.userinfo_endpoint, request);
      body = await response.json();
    } catch (error) {
      return Promise.reject(error);
    }

    if (!response?.ok) {
      this.logger.error('OidcClient', `unsuccessful response encountered from url ${this.issuerConfiguration.userinfo_endpoint}`, response);
      return Promise.reject(body);
    }

    return Promise.resolve(body);
  }

  private async verifyToken(): Promise<TokenResponse> {
    const token = await this.clientStorage.getToken();

    if (!token?.access_token) {
      this.logger.error('OidcClient', 'Token not found, make sure you have called authorize and getToken methods before attempting to get user info.', token);
      return null;
    }

    return token;
  }

  private async authenticationServerApiCall<T>(url: string, body: URLSearchParams): Promise<T> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    body.append('client_id', this.clientOptions.client_id);

    const request: RequestInit = {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
    };

    this.logger.debug('OidcClient', 'POST url', url);
    this.logger.debug('OidcClient', 'POST request', request);

    const response = await fetch(url, request);

    if (!response?.ok) {
      this.logger.error('OidcClient', `Unsuccessful response encountered for url ${url}`, response);
      return Promise.reject(Error('Unsuccessful fetch call'));
    }

    // For some reason some auth servers (cough PingOne cough) will return an application/json content-type but have an empty body.
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
}
