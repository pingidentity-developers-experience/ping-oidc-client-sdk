/**
 * OAuth/OIDC SDK
 * Ping Identity
 * @author Technical Enablement Demo Team
 * @description A bare-bones sample app built with create-react-app (CRA) to show an implementation example.
 */

import { ClientOptions, ClientSecretAuthMethod, GrantType, OpenIdConfiguration, TokenResponse, ValidatedClientOptions } from './types';
import { Logger, OAuth, ClientStorage, Url, BrowserUrlManager } from './utilities';
import { ClientOptionsValidator } from './validators';

/**
 * Class representing the OIDC client. The main interface to the SDK.
 */
class OidcClient {
  private readonly clientOptions: ValidatedClientOptions;
  private readonly issuerConfiguration: OpenIdConfiguration;
  private readonly logger: Logger;
  private readonly clientStorage: ClientStorage;
  private readonly browserUrlManager: BrowserUrlManager;

  /**
   * It is recommended to initialize this class using the fromIssuer method which allows the open id configuration to be built
   * from your issuer's well-known endpoint. However if you wish, you can initialize the OidcClient class manually passing
   * in the OpenIdConfiguation manually.
   *
   * @param clientOptions {ClientOptions} Options for the OIDC Client, clientId and redirectUri are required
   * @param issuerConfig {OpenIdConfiguration} OpenIdConfiguration object that the library will use
   */
  constructor(clientOptions: ClientOptions, issuerConfig: OpenIdConfiguration) {
    this.logger = new Logger(clientOptions?.logLevel);

    if (!clientOptions || !issuerConfig) {
      throw Error('clientOptions and issuerConfig are required to initialize an OidcClient');
    }

    this.browserUrlManager = new BrowserUrlManager(this.logger);
    this.clientStorage = new ClientStorage();

    // TODO - validator for issuerConfig?
    this.issuerConfiguration = issuerConfig;
    this.clientOptions = new ClientOptionsValidator(this.logger).validate(clientOptions);

    if (this.hasToken || this.browserUrlManager.tokenReady) {
      this.getToken().then((token) => {
        this.clientOptions.tokenAvailableCallback?.(token);
      });
    }
  }

  /**
   * Whether there is a token managed by the library available
   */
  get hasToken(): boolean {
    return !!this.clientStorage.getToken()?.access_token;
  }

  /**
   * Creates the client-options object for you using the metadata from your authorization servers well-known endpoint.
   *
   * @param issuerUrl {string} Base URL for the issuer, /.well-known/openid-configuration will be appended in this method
   * @param clientOptions {ClientOptions} Options for the OIDC Client, clientId and redirectUri are required
   * @returns {object}
   * @see https://www.rfc-editor.org/rfc/rfc8414.html#section-3
   * @see https://openid.net/specs/openid-connect-discovery-1_0.html#IssuerDiscovery
   */
  static async fromIssuer(issuerUrl: string, clientOptions: ClientOptions): Promise<OidcClient> {
    if (typeof issuerUrl !== 'string' || !Url.isValidUrl(issuerUrl, true)) {
      return Promise.reject(new Error(`Error creating an OpenIdClient please ensure you have entered a valid url ${issuerUrl}`));
    }

    try {
      const wellKnownResponse = await fetch(`${Url.trimTrailingSlash(issuerUrl)}/.well-known/openid-configuration`);
      const responseBody = await wellKnownResponse.json();

      return new OidcClient(clientOptions, responseBody);
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
  async authorize(loginHint?: string): Promise<void> {
    try {
      const authUrl = await this.authorizeUrl(loginHint);
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
   * @returns {Promise<string>} Promise that will resolve with a url you should redirect to
   */
  async authorizeUrl(loginHint?: string): Promise<string> {
    this.logger.debug('OidcClient', 'authorized called');

    if (!this.issuerConfiguration?.authorization_endpoint) {
      return Promise.reject(
        Error(
          `No authorization_endpoint has not been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a authorization_enpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    const urlParams = new URLSearchParams();
    urlParams.append('response_type', this.clientOptions.grantType === GrantType.Token ? 'token' : 'code');
    urlParams.append('client_id', this.clientOptions.clientId);
    urlParams.append('redirect_uri', this.clientOptions.redirectUri);
    urlParams.append('scope', this.clientOptions.scope);

    if (this.clientOptions.grantType === GrantType.AuthorizationCode) {
      const pkceArtifacts = await OAuth.generatePkceArtifacts(this.clientOptions, this.logger);
      urlParams.append('state', pkceArtifacts.state);
      urlParams.append('nonce', pkceArtifacts.nonce);

      if (this.clientOptions.usePkce) {
        urlParams.append('code_challenge', pkceArtifacts.codeChallenge);
        // Basic is not recommended, just use S256
        urlParams.append('code_challenge_method', 'S256');
        this.clientStorage.storeCodeVerifier(pkceArtifacts.codeVerifier);
      }
    }

    if (loginHint) {
      urlParams.append('login_hint', encodeURIComponent(loginHint));
    }

    return Promise.resolve(`${this.issuerConfiguration?.authorization_endpoint}?${urlParams.toString()}`);
  }

  /**
   * Get a token. It will check for tokens in the following order:
   *
   * 1. Previously stored token
   * 2. Token from the URL Hash (implicit, grantType: 'token')
   * 3. Token from the authorization server (authorization_code, grantType: 'authorization_code' or default)
   *
   * Getting a token from the authorization server requires a 'code' url parameter or manually passing in the code if you'd like to manage it yourself.
   * Please note if the token or code is retreived from the url it will automatically be removed from the URL and browser history after the library has
   * a token.
   *
   * @returns Token response from auth server
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.2
   * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1
   */
  async getToken(): Promise<TokenResponse> {
    this.logger.debug('OidcClient', 'getToken called');

    let token = this.clientStorage.getToken();

    if (token) {
      return Promise.resolve(token);
    }

    if (!this.issuerConfiguration?.token_endpoint) {
      return Promise.reject(
        Error(
          `No token_endpoint has not been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a token_enpoint with the OpenIdConfiguration object`,
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
      body.append('grant_type', this.clientOptions.grantType);
      body.append('code', code);
      body.append('redirect_uri', this.clientOptions.redirectUri);

      if (this.clientOptions.grantType === GrantType.AuthorizationCode) {
        if (this.clientOptions.usePkce) {
          // PKCE uses a code_verifier from client and does not require client secret authentication
          const codeVerifier = this.clientStorage.getCodeVerifier();

          if (!codeVerifier) {
            throw Error('usePkce is true but a code verifier was not found in localStorage');
          }

          body.append('code_verifier', codeVerifier);
        }
      }

      try {
        token = await this.clientSecretAuthenticatedApiCall<TokenResponse>(this.issuerConfiguration.token_endpoint, body);
      } catch (error) {
        return Promise.reject(error);
      }
    }

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

    const token = this.verifyToken();

    if (!token) {
      return Promise.reject(Error('No token available'));
    }

    if (!this.issuerConfiguration?.revocation_endpoint) {
      return Promise.reject(
        Error(
          `No revocation_endpoint has not been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a userinfo_endpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    const body = new URLSearchParams();
    body.append('token', token.access_token);
    body.append('token_type_hint', 'access_token');

    try {
      const revokeResponse = await this.clientSecretAuthenticatedApiCall(this.issuerConfiguration.revocation_endpoint, body);
      this.clientStorage.removeToken();
      return revokeResponse;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Retreive the User Info from the issuer, uses OpenIdConfiguration from the server and the token managed by the library
   *
   * @returns {any} User Info returned from the issuer
   * @see https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
   */
  async fetchUserInfo<T>(): Promise<T> {
    this.logger.debug('OidcClient', 'fetchUserInfo called');

    const token = this.verifyToken();

    if (!token) {
      return Promise.reject(Error('No token available'));
    }

    if (!this.issuerConfiguration?.userinfo_endpoint) {
      return Promise.reject(
        Error(
          `No userinfo_endpoint has not been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a userinfo_endpoint with the OpenIdConfiguration object`,
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

    if (response?.ok) {
      return Promise.resolve(body);
    }
    this.logger.error('OidcClient', `unsuccessful response ecounterd from url ${this.issuerConfiguration.userinfo_endpoint}`, response);

    return Promise.reject(body);
  }

  private verifyToken(): TokenResponse {
    const token = this.clientStorage.getToken();

    if (!token?.access_token) {
      this.logger.error('OidcClient', 'Token not found, make sure you have called authorize and getToken methods before attempting to get user info.', token);
      return null;
    }

    return token;
  }

  private async clientSecretAuthenticatedApiCall<T>(url: string, body: URLSearchParams): Promise<T> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    body.append('client_id', this.clientOptions.clientId);

    if (this.clientOptions.clientSecretAuthMethod === ClientSecretAuthMethod.Post) {
      this.logger.info('OidcClient', 'client secret auth method is Post, adding to request body');
      body.append('client_secret', this.clientOptions.clientSecret);
    } else if (this.clientOptions.clientSecretAuthMethod === ClientSecretAuthMethod.Basic) {
      this.logger.info('OidcClient', 'client secret auth method is Basic, adding Authorization request header');
      headers.append('Authorization', `Basic ${OAuth.btoa(`${this.clientOptions.clientId}:${this.clientOptions.clientSecret}`)}`);
    }

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
      this.logger.error('OidcClient', `unsuccessful response encountered for url ${url}`, response);
    }

    // For some reason some auth servers (cough PingOne cough) will return an application/json content-type but have an empty body.
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
}

export default OidcClient;
