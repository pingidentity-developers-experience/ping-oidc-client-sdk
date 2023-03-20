import OidcClient from '../src/oidc-client';
import { ClientOptionsValidator } from '../src/validators';
import { OAuth, ClientStorage } from '../src/utilities';
import { ClientSecretAuthMethod, GrantType } from '../src/types';

jest.mock('../src/utilities/logger');
jest.mock('../src/utilities/oauth');
jest.mock('../src/utilities/client-storage');
jest.mock('../src/validators/client-options-validator');

describe('OidcClient', () => {
  function createTokenSpy() {
    jest.spyOn(ClientStorage.prototype, 'getToken').mockReturnValueOnce({
      access_token: 'some_token',
    });
  }

  function createClientOptionsValidatorSpy() {
    jest.spyOn(ClientOptionsValidator.prototype, 'validate').mockImplementationOnce((options) => options);
  }

  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    }),
  );

  let mockStorage = {};

  beforeAll(() => {
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value;
    });
  });

  beforeEach(() => {
    fetch.mockClear();
    ClientOptionsValidator.mockClear();
    ClientStorage.mockClear();
    OAuth.mockClear();
    mockStorage = {};
  });

  describe('constructor', () => {
    it('should throw error if ClientOptions are not provided', () => {
      const options = undefined;
      const config = {};

      expect(() => new OidcClient(options, config)).toThrow('clientOptions and issuerConfig are required to initialize an OidcClient');
    });

    it('should throw error if OpenIdConfiguration is not provided', () => {
      const options = {};
      const config = undefined;

      expect(() => new OidcClient(options, config)).toThrow('clientOptions and issuerConfig are required to initialize an OidcClient');
    });

    it('should call client options validator with ClientOptions and set up other dependencies', () => {
      // These just need to be truthy for this test
      const options = {};
      const config = {};

      const client = new OidcClient(options, config);

      expect(ClientOptionsValidator.mock.instances[0].validate).toHaveBeenCalledWith(options);

      // TypeScript happy way to access private properties
      expect(client['issuerConfiguration']).toBe(config);
      expect(client['clientStorage']).not.toBeUndefined();
    });
  });

  describe('fromIssuer', () => {
    it('should error on invalid url type', async () => {
      await expect(OidcClient.fromIssuer(12, {})).rejects.toMatchObject(Error('Error creating an OpenIdClient please ensure you have entered a valid url 12'));
    });

    it('should error on invalid url', async () => {
      await expect(OidcClient.fromIssuer('www.google.com', {})).rejects.toMatchObject(Error('Error creating an OpenIdClient please ensure you have entered a valid url www.google.com'));
    });

    it('should create OidcClient from successful well-known response', async () => {
      const issuerConfig = { issuer: 'https://example.com' };
      const clientConfig = { clientId: 'abc', redirectUri: 'https://test.com' };

      fetch.mockResolvedValueOnce({ json: () => Promise.resolve(issuerConfig) });
      jest.spyOn(ClientOptionsValidator.prototype, 'validate').mockImplementationOnce((config) => config);

      const client = await OidcClient.fromIssuer(issuerConfig.issuer, clientConfig);
      expect(client.issuerConfiguration).toBe(issuerConfig);
      expect(client.clientOptions).toBe(clientConfig);
    });

    it('should pass api errors back to the client', async () => {
      const issuerConfig = { issuer: 'https://example.com' };
      const clientConfig = { clientId: 'abc', redirectUri: 'https://test.com' };

      fetch.mockRejectedValueOnce(Error('API not working'));

      await expect(OidcClient.fromIssuer(issuerConfig.issuer, clientConfig)).rejects.toMatchObject(Error('API not working'));
    });

    it('should pass json parse errors back to the client', async () => {
      const issuerConfig = { issuer: 'https://example.com' };
      const clientConfig = { clientId: 'abc', redirectUri: 'https://test.com' };

      fetch.mockResolvedValueOnce({ json: () => Promise.reject(Error('Invalid json')) });

      await expect(OidcClient.fromIssuer(issuerConfig.issuer, clientConfig)).rejects.toMatchObject(Error('Invalid json'));
    });
  });

  describe('authorize', () => {
    it('should throw error if there is no authorization endpoint in issuer config', async () => {
      const client = new OidcClient({}, {});
      await expect(client.authorize()).rejects.toMatchObject(
        Error(
          `No authorization_endpoint has not been found, either initialize the client with OidcClient.fromIssuer() using an issuer with a .well-known endpoint or ensure you have passed in a authorization_enpoint with the OpenIdConfiguration object`,
        ),
      );
    });

    it('should generate url with correct default parameters', async () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient({ clientId: 'abc123', redirectUri: 'https://example.com', scope: 'openid profile' }, { authorization_endpoint: 'https://google.com/as/authorize' });
      const url = await client.authorize();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(params.get('response_type')).toBe('code');
      expect(params.get('client_id')).toBe('abc123');
      expect(params.get('redirect_uri')).toBe('https://example.com');
      expect(params.get('scope')).toBe('openid profile');
    });

    it('should generate url with token response type', async () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient(
        { clientId: 'abc123', redirectUri: 'https://example.com', scope: 'openid profile', grantType: GrantType.Token },
        { authorization_endpoint: 'https://google.com/as/authorize' },
      );
      const url = await client.authorize();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(params.get('response_type')).toBe('token');
      expect(params.get('client_id')).toBe('abc123');
      expect(params.get('redirect_uri')).toBe('https://example.com');
      expect(params.get('scope')).toBe('openid profile');
    });

    it('should generate url with correct parameters for code response type and usePkce false', async () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient(
        { clientId: 'abc123', redirectUri: 'https://example.com', scope: 'openid profile', grantType: GrantType.AuthorizationCode, usePkce: false },
        { authorization_endpoint: 'https://google.com/as/authorize' },
      );

      jest.spyOn(OAuth, 'generatePkceArtifacts').mockResolvedValueOnce({ state: 'aabbccddee', nonce: 'ffgghhiijj', codeChallenge: 'abcdefghijk', codeVerifier: 'lmnopqrst' });

      const url = await client.authorize();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(params.get('response_type')).toBe('code');
      expect(params.get('state')).toBe('aabbccddee');
      expect(params.get('nonce')).toBe('ffgghhiijj');
      expect(params.get('code_challenge')).toBeNull();
      expect(params.get('code_challenge_method')).toBeNull();
      expect(params.get('login_hint')).toBeNull();
    });

    it('should generate url with correct parameters for code response type and usePkce true', async () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient(
        { clientId: 'abc123', redirectUri: 'https://example.com', scope: 'openid profile', grantType: GrantType.AuthorizationCode, usePkce: true },
        { authorization_endpoint: 'https://google.com/as/authorize' },
      );

      jest.spyOn(OAuth, 'generatePkceArtifacts').mockResolvedValueOnce({ state: 'aabbccddee', nonce: 'ffgghhiijj', codeChallenge: 'abcdefghijk', codeVerifier: 'lmnopqrst' });

      const url = await client.authorize();
      const params = new URLSearchParams(url.split('?')[1]);

      expect(params.get('response_type')).toBe('code');
      expect(params.get('state')).toBe('aabbccddee');
      expect(params.get('nonce')).toBe('ffgghhiijj');
      expect(params.get('code_challenge')).toBe('abcdefghijk');
      expect(params.get('code_challenge_method')).toBe('S256');
      expect(params.get('login_hint')).toBeNull();

      expect(ClientStorage.mock.instances[0].storeCodeVerifier).toHaveBeenCalledWith('lmnopqrst');
    });

    it('should append login_hint parameter if provided', async () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient({ clientId: 'abc123', redirectUri: 'https://example.com', scope: 'openid profile' }, { authorization_endpoint: 'https://google.com/as/authorize' });
      const url = await client.authorize('test_user');
      const params = new URLSearchParams(url.split('?')[1]);

      expect(params.get('login_hint')).toBe('test_user');
    });
  });

  describe('getToken', () => {
    it('should return existing token from client storage', () => {});
    it('should throw error if token_endpoint is missing from issuer config', () => {});
    it('should get token from url if it exists (implicit grant)', () => {});
    it('should throw error if no existing token and no code is present in url', () => {});
  });

  describe('revokeToken', () => {
    it('should reject with no token available', async () => {
      const client = new OidcClient({}, {});
      await expect(client.fetchUserInfo()).rejects.toMatchObject(Error('No token available'));
    });

    it('should call clientSecretAuthenticatedApiCall with correct parameters', async () => {
      const issuerConfig = {
        revocation_endpoint: 'https://example.com/revoke_token',
      };
      const clientOptions = {
        clientId: 'abc',
      };

      let requestBody;

      createTokenSpy();
      createClientOptionsValidatorSpy();

      const client = new OidcClient(clientOptions, issuerConfig);

      const authCallSpy = jest.spyOn(client, 'clientSecretAuthenticatedApiCall').mockImplementationOnce((_, body) => {
        requestBody = body;
      });

      await client.revokeToken();

      expect(authCallSpy).toHaveBeenCalledWith(issuerConfig.revocation_endpoint, expect.any(URLSearchParams));
      expect(requestBody.get('token')).toEqual('some_token');
      expect(requestBody.get('token_type_hint')).toEqual('access_token');
    });

    it('should remove token from session storage on successful API call', async () => {
      createTokenSpy();
      createClientOptionsValidatorSpy();

      const client = new OidcClient({}, {});
      await client.revokeToken();

      expect(ClientStorage.mock.instances[0].removeToken).toHaveBeenCalled();
    });

    it('should pass api errors back to caller', async () => {
      createTokenSpy();
      createClientOptionsValidatorSpy();

      fetch.mockRejectedValueOnce(Error('API not working'));
      const client = new OidcClient({}, {});

      await expect(client.revokeToken()).rejects.toMatchObject(Error('API not working'));
    });
  });

  describe('fetchUserInfo', () => {
    it('should reject with no token available', async () => {
      const client = new OidcClient({}, {});
      await expect(client.fetchUserInfo()).rejects.toMatchObject(Error('No token available'));
    });

    it('should make fetch call with correct url and http method', async () => {
      const issuerConfig = {
        userinfo_endpoint: 'https://example.com/userinfo',
      };

      createTokenSpy();

      const client = new OidcClient({}, issuerConfig);
      await client.fetchUserInfo();

      expect(fetch).toHaveBeenCalledWith(issuerConfig.userinfo_endpoint, expect.objectContaining({ method: 'GET' }));
    });

    it('should make fetch call with correct header', async () => {
      let requestHeaders;
      const issuerConfig = {
        userinfo_endpoint: 'https://example.com/userinfo',
      };

      createTokenSpy();

      jest.spyOn(global, 'fetch').mockImplementationOnce((_, request) => {
        requestHeaders = request.headers; // This is janky but I don't know how else to do it
        return {
          json: () => Promise.resolve({}),
        };
      });

      const client = new OidcClient({}, issuerConfig);
      await client.fetchUserInfo();

      expect(requestHeaders.get('Authorization')).toBe('Bearer some_token');
    });

    it('should pass user_info json response to caller', async () => {
      createTokenSpy();
      const result = { sub: 'test_user' };

      jest.spyOn(global, 'fetch').mockReturnValueOnce({
        json: () => Promise.resolve(result),
      });

      const client = new OidcClient({}, {});
      const userInfo = await client.fetchUserInfo();

      expect(userInfo).toBe(result);
    });

    it('should pass api errors back to caller', async () => {
      createTokenSpy();
      fetch.mockRejectedValueOnce(Error('API not working'));
      const client = new OidcClient({}, {});

      await expect(client.fetchUserInfo()).rejects.toMatchObject(Error('API not working'));
    });

    it('should pass json parse errors back to caller', async () => {
      createTokenSpy();
      fetch.mockResolvedValueOnce({ json: () => Promise.reject(Error('Invalid json')) });
      const client = new OidcClient({}, {});

      await expect(client.fetchUserInfo()).rejects.toMatchObject(Error('Invalid json'));
    });
  });

  describe('hasToken', () => {
    it('should be true if there is a token in TokenStorage', () => {
      createTokenSpy();

      const client = new OidcClient({}, {});
      expect(client.hasToken).toBe(true);
    });

    it('should be false if there is no token in TokenStorage', () => {
      jest.spyOn(ClientStorage.prototype, 'getToken').mockReturnValueOnce(null);

      const client = new OidcClient({}, {});
      expect(client.hasToken).toBe(false);
    });
  });

  describe('clientSecretAuthenticateApiCall', () => {
    it('should make a fetch request with correct default parameters', () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient({ clientId: 'abc123' }, {});

      let requestHeaders;
      let requestBody;

      const fetchSpy = jest.spyOn(global, 'fetch').mockImplementationOnce((_, request) => {
        requestHeaders = request.headers; // This is janky but I don't know how else to do it
        requestBody = request.body;
        return {
          json: () => Promise.resolve({}),
        };
      });

      const testBody = new URLSearchParams();
      testBody.append('some_key', 'some_value');

      client.clientSecretAuthenticatedApiCall('https://example.com', testBody);

      expect(fetchSpy).toHaveBeenCalledWith('https://example.com', expect.objectContaining({ method: 'POST', redirect: 'manual' }));
      expect(requestBody.get('client_id')).toBe('abc123');
      expect(requestHeaders.get('Content-Type')).toBe('application/x-www-form-urlencoded');

      expect(requestBody.get('client_secret')).toBeNull();
      expect(requestHeaders.get('Authorization')).toBeNull();
    });

    it('should add client secret to body if ClientSecretAuthMethod is post', () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient({ clientId: 'abc123', clientSecret: 'xyz789', clientSecretAuthMethod: ClientSecretAuthMethod.Post }, {});

      let requestBody;

      jest.spyOn(global, 'fetch').mockImplementationOnce((_, request) => {
        requestBody = request.body;
        return {
          json: () => Promise.resolve({}),
        };
      });

      client.clientSecretAuthenticatedApiCall('https://example.com', new URLSearchParams());

      expect(requestBody.get('client_id')).toBe('abc123');
      expect(requestBody.get('client_secret')).toBe('xyz789');
    });

    it('should add authorization header if ClientSecretAuthMethod is basic', () => {
      createClientOptionsValidatorSpy();

      const client = new OidcClient({ clientId: 'abc123', clientSecret: 'xyz789', clientSecretAuthMethod: ClientSecretAuthMethod.Basic }, {});

      let requestBody;
      let requestHeaders;

      jest.spyOn(global, 'fetch').mockImplementationOnce((_, request) => {
        requestBody = request.body;
        requestHeaders = request.headers;
        return {
          json: () => Promise.resolve({}),
        };
      });

      jest.spyOn(OAuth, 'btoa').mockReturnValueOnce('YWJjMTIzOnh5ejc4OQ==');

      client.clientSecretAuthenticatedApiCall('https://example.com', new URLSearchParams());

      expect(requestBody.get('client_id')).toBe('abc123');
      expect(requestHeaders.get('Authorization')).toBe('Basic YWJjMTIzOnh5ejc4OQ==');
    });
  });
});
