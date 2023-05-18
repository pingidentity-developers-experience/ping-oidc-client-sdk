/* eslint-disable camelcase */
/**
 * OAuth/OIDC SDK
 * Ping Identity
 * @author Technical Enablement Demo Team
 * @description The main entry point for your application's integration.
 */

import { ClientOptions, ResponseType, OpenIdConfiguration, TokenResponse, ValidatedClientOptions, IntrospectionResponse } from './types';
import { Logger, OAuth, ClientStorage, Url, BrowserUrlManager } from './utilities';
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

    this.browserUrlManager = new BrowserUrlManager(this.logger);
    this.clientStorage = new ClientStorage();

    // TODO - validator for issuerConfig?
    this.issuerConfiguration = issuerConfig;
    this.clientOptions = new ClientOptionsValidator(this.logger, this.browserUrlManager).validate(clientOptions);

    if (this.hasToken || this.browserUrlManager.tokenReady) {
      const preExistingToken = this.hasToken;
      this.getToken().then((token) => {
        let state;
        if (!preExistingToken) {
          state = this.browserUrlManager.checkUrlForState();
        }
        this.clientOptions.tokenAvailableCallback?.(token, state);
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
   * @param clientOptions {ClientOptions} Options for the OIDC Client, client_id is required
   * @returns {object}
   * @see https://www.rfc-editor.org/rfc/rfc8414.html#section-3
   * @see https://openid.net/specs/openid-connect-discovery-1_0.html#IssuerDiscovery
   */
  static async initializeFromOpenIdConfig(issuerUrl: string, clientOptions: ClientOptions): Promise<OidcClient> {
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
   * 2. Token from the URL Hash (implicit, grant_type: 'token')
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
  async getToken(refresh_token?: string): Promise<TokenResponse> {
    this.logger.debug('OidcClient', 'getToken called');

    if (refresh_token) {
      console.log("you're refreshing", refresh_token);
      // let token = this.verifyToken();
      let token;
      // console.log('logging token', token);
      const body = new URLSearchParams();
      body.append('grant_type', 'refresh_token');
      body.append('refresh_token', refresh_token);

      try {
        token = await this.authenticationServerApiCall<TokenResponse>(this.issuerConfiguration.token_endpoint, body);
        this.clientStorage.storeToken(token);
        await this.introspectToken();
        return Promise.resolve(token);
      } catch (error) {
        // Refresh token failed, expired or invalid. Default to silent authN request.
        await this.authorize(undefined, true);
        return Promise.reject(error);
      }
    }

    // Clear lingering token from storage if a new one is ready.
    if (this.browserUrlManager.tokenReady) {
      this.clientStorage.removeToken();
    }

    let token = this.clientStorage.getToken();

    if (token) {
      await this.introspectToken();
      return Promise.resolve(token);
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
      body.append('grant_type', this.clientOptions.response_type === ResponseType.Token ? 'token' : 'authorization_code');
      body.append('code', code);
      body.append('redirect_uri', this.clientOptions.redirect_uri);

      if (this.clientOptions.response_type === ResponseType.AuthorizationCode) {
        if (this.clientOptions.usePkce) {
          // PKCE uses a code_verifier from client
          const codeVerifier = this.clientStorage.getCodeVerifier();

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

    this.clientStorage.storeToken(token);

    return Promise.resolve(token);
  }

  /**
   * Introspect existing access token
   *
   * @returns {any} - HTTP response 200 only.
   * @see https://www.rfc-editor.org/rfc/rfc7662#section-2
   */
  async introspectToken(): Promise<any> {
    this.logger.debug('OidcClient', 'introspectToken called');

    const token = this.verifyToken();

    if (!token) {
      return Promise.reject(Error('No token available'));
    }

    if (!this.issuerConfiguration?.introspection_endpoint) {
      return Promise.reject(
        Error(
          `No introspection_endpoint has been found, either initialize the client with OidcClient.initializeFromOpenIdConfig() using an issuer with a .well-known endpoint or ensure you have passed in a userinfo_endpoint with the OpenIdConfiguration object`,
        ),
      );
    }

    const body = new URLSearchParams();
    body.append('token', token.access_token);
    body.append('token_type_hint', 'access_token');

    try {
      const introspectResponse = await this.authenticationServerApiCall<IntrospectionResponse>(this.issuerConfiguration.introspection_endpoint, body);
      // this.clientStorage.removeToken();
      if (!introspectResponse.active) {
        if (token.refresh_token) {
          console.log('refresh token', token.refresh_token);
          await this.getToken(token.refresh_token);
        } else {
          await this.authorize(undefined, true);
        }
      }
      console.log('introspect', introspectResponse);
      return introspectResponse;
    } catch (error) {
      return Promise.reject(error);
    }
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
   * Retrieve the User Info from the issuer, uses OpenIdConfiguration from the server and the token managed by the library
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

    console.log('headers', headers);

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

  private verifyToken(): TokenResponse {
    const token = this.clientStorage.getToken();

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
