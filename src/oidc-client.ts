import { ClientOptions, ClientSecretAuthMethod, GrantType, LogLevel, OpenIdConfiguration, TokenResponse, ValidatedClientOptions } from './types';
import { Logger, OAuth, TokenStorage, Url } from './utilities';
import { ClientOptionsValidator } from './validators';

class OidcClient {
  private readonly CODE_VERIFIER_KEY = 'oidc-client:code_verifier';

  private readonly clientOptions: ValidatedClientOptions;
  private readonly issuerConfiguration: OpenIdConfiguration;
  private readonly logger: Logger;
  private readonly tokenStorage: TokenStorage;

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
   * Takes an optional login_hint and returns a Promise containing the url you will redirect the user to.
   * Typically you will want to do window.location.assign(xxx) with the result.
   *
   * @param loginHint {string} login_hint url parameter that will be appended to URL in case you have a username/email already
   * @returns {Promise<string>} Promise that will resolve with a url you should redirect to
   */
  async authorize(loginHint?: string): Promise<string> {
    this.logger.debug('OidcClient', 'authorized called');

    let url = this.issuerConfiguration?.authorization_endpoint;

    if (!url) {
      throw Error(
        `No token_endpoint has been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a token_enpoint with the OpenIdConfiguration object`,
      );
    }

    url += `?response_type=${this.clientOptions.grantType === GrantType.Token ? 'token' : 'code'}&client_id=${this.clientOptions.clientId}&redirect_uri=${this.clientOptions.redirectUri}&scope=${
      this.clientOptions.scope
    }`;

    if (this.clientOptions.grantType === GrantType.AuthorizationCode) {
      const pkceArtifacts = await OAuth.generatePkceArtifacts(this.clientOptions, this.logger);
      url += `&state=${pkceArtifacts.state}&nonce=${pkceArtifacts.state}`;

      if (this.clientOptions.usePkce) {
        // Basic is not recommended, just use S256
        url += `&code_challenge=${pkceArtifacts.codeChallenge}&code_challenge_method=S256`;
        localStorage.setItem(this.CODE_VERIFIER_KEY, pkceArtifacts.codeVerifier);
      }
    }

    if (loginHint) {
      url += `&login_hint=${encodeURIComponent(loginHint)}`;
    }

    return Promise.resolve(url);
  }

  /**
   * Get a Token using the code from the authentication server, you can omit the code parameter and
   * this function will attempt to grab and clear it from the URL
   *
   * @param code {string} code from the redirect back to the app, if this is not provided the library will try to grab it from the URL for you.
   * @returns Token response from auth server
   */
  async getToken(code: string = this.checkUrlForCode()): Promise<TokenResponse> {
    this.logger.debug('OidcClient', 'getToken called', code);

    if (!code) {
      throw Error('An authorization code was not found');
    }

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

    const tokenResponse = await this.clientSecretAuthenticatedApiCall<TokenResponse>(this.issuerConfiguration.token_endpoint, body);
    this.tokenStorage.storeToken(tokenResponse);

    return tokenResponse;
  }

  async revokeToken(): Promise<any> {
    const token = this.tokenStorage.getToken();

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

  async fetchUserInfo(): Promise<any> {
    const token = this.tokenStorage.getToken();

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

  static async fromIssuer(issuerUrl: string, clientOptions: ClientOptions): Promise<OidcClient> {
    if (typeof issuerUrl !== 'string' || !Url.isValidUrl(issuerUrl, true)) {
      const errorMsg = `Error creating an OpenIdClient please ensure you have entered a valid url ${issuerUrl}`;
      return Promise.reject(errorMsg);
    }

    const wellKnown = await fetch(`${Url.trimTrailingSlash(issuerUrl)}/.well-known/openid-configuration`);
    const responseBody = await wellKnown.json();

    return new OidcClient(clientOptions, responseBody);
  }
}

export default OidcClient;
