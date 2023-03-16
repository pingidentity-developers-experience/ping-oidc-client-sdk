import { ClientOptions, ClientSecretAuthMethod, GrantType, LogLevel, OpenIdConfiguration, TokenResponse, ValidatedClientOptions } from './types';
import { Logger, OAuth, TokenStorage, Url } from './utilities';
import { ClientOptionsValidator } from './validators';

class OidcClient {
  private readonly CODE_VERIFIER_KEY = 'oidc-client:code_verifier';

  private readonly clientOptions: ValidatedClientOptions;
  private readonly issuerConfiguration: OpenIdConfiguration;
  private readonly logger: Logger;
  private readonly tokenStorage: TokenStorage;

  /**
   * It is recommended to initialize this class using the fromIssuer method which allows the open id configuration to be built
   * from your issuer's well-known endpoint. However if you wish, you can initialize the OidcClient class manually passing
   * in the OpenIdConfiguation manually.
   *
   * @param clientOptions {ClientOptions} Options for the OIDC Client, clientId and redirectUri are required
   * @param issuerConfig {OpenIdConfiguration} OpenIdConfiguration object that the library will use
   */
  constructor(clientOptions: ClientOptions, issuerConfig: OpenIdConfiguration) {
    this.logger = new Logger(clientOptions?.logLevel || LogLevel.Warning);

    if (!clientOptions || !issuerConfig) {
      throw Error('clientOptions and issuerConfig are required to initialize an OidcClient');
    }

    // TODO - validator for issuerConfig?
    this.issuerConfiguration = issuerConfig;
    this.clientOptions = new ClientOptionsValidator(this.logger).validate(clientOptions);

    this.tokenStorage = new TokenStorage();
  }

  /**
   *
   * @param issuerUrl {string} Base URL for the issuer, /.well-known/openid-configuration will be appended in this method
   * @param clientOptions {ClientOptions} Options for the OIDC Client, clientId and redirectUri are required
   * @returns
   */
  static async fromIssuer(issuerUrl: string, clientOptions: ClientOptions): Promise<OidcClient> {
    if (typeof issuerUrl !== 'string' || !Url.isValidUrl(issuerUrl, true)) {
      const errorMsg = `Error creating an OpenIdClient please ensure you have entered a valid url ${issuerUrl}`;
      return Promise.reject(errorMsg);
    }

    const wellKnown = await fetch(`${Url.trimTrailingSlash(issuerUrl)}/.well-known/openid-configuration`);
    const responseBody = await wellKnown.json();

    return new OidcClient(clientOptions, responseBody);
  }

  /**
   * Takes an optional login_hint and returns a Promise containing the url you will redirect the user to.
   * Typically you will want to apply the url to an anchor tag or redirect to it using window.location.assign(xxx).
   *
   * @param loginHint {string} login_hint url parameter that will be appended to URL in case you have a username/email already
   * @returns {Promise<string>} Promise that will resolve with a url you should redirect to
   */
  async authorize(loginHint?: string): Promise<string> {
    this.logger.debug('OidcClient', 'authorized called');

    const url = this.issuerConfiguration?.authorization_endpoint;

    if (!url) {
      throw Error(
        `No token_endpoint has not been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a token_enpoint with the OpenIdConfiguration object`,
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
        localStorage.setItem(this.CODE_VERIFIER_KEY, pkceArtifacts.codeVerifier);
      }
    }

    if (loginHint) {
      urlParams.append('login_hint', encodeURIComponent(loginHint));
    }

    return Promise.resolve(`${url}?${urlParams.toString()}`);
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
   * @param code {string} code from the redirect back to the app, if this is not provided the library will try to grab it from the URL for you.
   * @returns Token response from auth server
   */
  async getToken(code: string = this.checkUrlForCode()): Promise<TokenResponse> {
    let token = this.tokenStorage.getToken();

    if (token) {
      return Promise.resolve(token);
    }

    this.logger.debug('OidcClient', 'getToken called', code);

    token = this.checkUrlForToken();

    if (!token && !code) {
      throw Error('An authorization code was not found and a token was not found in storage or the url hash');
    } else {
      const body = new URLSearchParams();
      body.append('grant_type', this.clientOptions.grantType);
      body.append('code', code);
      body.append('redirect_uri', this.clientOptions.redirectUri);

      if (this.clientOptions.grantType === GrantType.AuthorizationCode) {
        if (this.clientOptions.usePkce) {
          // PKCE uses a code_verifier from client and does not require client secret authentication
          const codeVerifier = localStorage.getItem(this.CODE_VERIFIER_KEY);

          if (!codeVerifier) {
            throw Error('usePkce is true but a code verifier was not found in localStorage');
          }

          body.append('code_verifier', localStorage.getItem(this.CODE_VERIFIER_KEY));
        }
      }

      token = await this.clientSecretAuthenticatedApiCall<TokenResponse>(this.issuerConfiguration.token_endpoint, body);
    }

    this.tokenStorage.storeToken(token);

    return token;
  }

  /**
   * Revoke the token managed by the library
   *
   * @returns {any} - TODO, anything important in revoke response?
   */
  async revokeToken(): Promise<any> {
    const token = this.tokenStorage.getToken();

    if (token?.access_token) {
      const msg = 'Token not found, make sure you have called authorize and getToken methods before attempting to get user info.';
      this.logger.error('OidcClient', msg, token);
      return Promise.reject(msg);
    }

    const body = new URLSearchParams();
    // TODO this is not working unsupported_token_type,
    // see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-token-revocation, PingOne configuration issue?
    // body.append('client_id', this.clientOptions.clientId);
    // TODO need to support refresh tokens?
    body.append('token', token.access_token);
    body.append('token_type_hint', 'access_token');

    const revokeResponse = await this.clientSecretAuthenticatedApiCall(this.issuerConfiguration.revocation_endpoint, body);
    this.tokenStorage.removeToken();

    return revokeResponse;
  }

  /**
   * Retreive the User Info from the issuer, uses OpenIdConfiguration from the server and the token managed by the library
   *
   * @returns {any} User Info returned from the issuer
   */
  async fetchUserInfo(): Promise<any> {
    const token = this.tokenStorage.getToken();

    if (token?.access_token) {
      const msg = 'Token not found, make sure you have called authorize and getToken methods before attempting to get user info.';
      this.logger.error('OidcClient', msg, token);
      return Promise.reject(msg);
    }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token.access_token}`);

    const request: RequestInit = {
      method: 'GET',
      headers,
    };

    const response = await fetch(this.issuerConfiguration.userinfo_endpoint, request);
    const responseBody = await response.json();

    return responseBody;
  }

  private checkUrlForCode(): string {
    const location = window?.location;

    if (location) {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');

      if (code) {
        urlParams.delete('code');
        const query = urlParams.toString();
        const queryStr = query ? `?${query}` : '';
        window.history.replaceState(null, null, location.pathname + queryStr + location.hash);
      }

      return code;
    }

    return '';
  }

  private checkUrlForToken(): TokenResponse {
    const hashFragment = window?.location?.hash;

    if (hashFragment) {
      const hashParams = new URLSearchParams(hashFragment.charAt(0) === '#' ? hashFragment.substring(1) : hashFragment);

      if (hashParams.has('access_token')) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
        return {
          access_token: hashParams.get('access_token'),
          expires_in: +hashParams.get('expires_in'),
          scope: hashParams.get('scope'),
          token_type: hashParams.get('token_type'),
          id_token: hashParams.get('id_token'),
        };
      }
    }

    return null;
  }

  private async clientSecretAuthenticatedApiCall<T>(url: string, body: URLSearchParams): Promise<T> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    body.append('client_id', this.clientOptions.clientId);

    if (this.clientOptions.clientSecretAuthMethod === ClientSecretAuthMethod.Post) {
      body.append('client_secret', this.clientOptions.clientSecret);
    } else if (this.clientOptions.clientSecretAuthMethod === ClientSecretAuthMethod.Basic) {
      headers.append('Authorization', `Basic ${window.btoa(`${this.clientOptions.clientId}:${this.clientOptions.clientSecret}`)}`);
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
    const responseBody = await response.json();

    return responseBody;
  }
}

export default OidcClient;
