import OidcClient from '../src/oidc-client';
import { ClientOptionsValidator } from '../src/validators';
import { TokenStorage } from '../src/utilities';

jest.mock('../src/utilities/logger');
jest.mock('../src/validators/client-options-validator');

jest.mock('../src/utilities/token-storage');

describe('OidcClient', () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    }),
  );

  beforeEach(() => {
    fetch.mockClear();
    ClientOptionsValidator.mockClear();
    TokenStorage.mockClear();
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
      expect(client['tokenStorage']).not.toBeUndefined();
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

      fetch.mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve(issuerConfig) }));
      jest.spyOn(ClientOptionsValidator.prototype, 'validate').mockImplementationOnce((config) => config);

      const client = await OidcClient.fromIssuer(issuerConfig.issuer, clientConfig);
      expect(client.issuerConfiguration).toBe(issuerConfig);
      expect(client.clientOptions).toBe(clientConfig);
    });

    it('should pass api errors back to the client', async () => {
      const issuerConfig = { issuer: 'https://example.com' };
      const clientConfig = { clientId: 'abc', redirectUri: 'https://test.com' };

      fetch.mockImplementationOnce(() => Promise.reject(new Error('API not working')));

      await expect(OidcClient.fromIssuer(issuerConfig.issuer, clientConfig)).rejects.toMatchObject(Error('API not working'));
    });

    it('should pass api errors back to the client', async () => {
      const issuerConfig = { issuer: 'https://example.com' };
      const clientConfig = { clientId: 'abc', redirectUri: 'https://test.com' };

      fetch.mockImplementationOnce(() => Promise.resolve({ json: () => Promise.reject(new Error('Invalid json')) }));

      await expect(OidcClient.fromIssuer(issuerConfig.issuer, clientConfig)).rejects.toMatchObject(Error('Invalid json'));
    });
  });
});
