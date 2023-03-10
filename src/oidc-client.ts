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
   *
   * @param param {ClientOptions} input options that will be used to generate and send the request
   * @returns
   */
  async authorize(): Promise<string> {
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

    return Promise.resolve(url);
  }

  /**
   * Get a Token using the code from the authentication server, you can omit the code parameter and
   * this function will attempt to grab and clear it from the URL
   *
   * @param code {string} code from the redirect back to the app, if this is not provided the library will try to grab it from the URL for you.
   * @returns Token response from auth server
   */
  async getToken(code?: string): Promise<TokenResponse> {
    this.logger.debug('OidcClient', 'getToken called', code);

    let safeCode = code;

    if (!safeCode) {
      safeCode = this.checkUrlForCode();
    }

    if (!safeCode) {
      throw Error('An authorization code was not found');
    }

    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.append('client_id', this.clientOptions.clientId);
    body.append('grant_type', this.clientOptions.grantType);
    body.append('code', safeCode);
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

      if (this.clientOptions.clientSecretAuthMethod === ClientSecretAuthMethod.Post) {
        body.append('client_secret', this.clientOptions.clientSecret);
      } else if (this.clientOptions.clientSecretAuthMethod === ClientSecretAuthMethod.Basic) {
        headers.append('Authorization', `Basic ${window.btoa(`${this.clientOptions.clientId}:${this.clientOptions.clientSecret}`)}`);
      }
    }

    const request: RequestInit = {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
    };

    const url = this.issuerConfiguration.token_endpoint;

    this.logger.debug('PingOneOidc', 'Authorize POST url', url);
    this.logger.debug('PingOneOidc', 'Authorize POST request', request);

    const response = await fetch(url, request);
    const responseBody = await response.json();

    this.tokenStorage.storeToken(responseBody);

    return responseBody;
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
