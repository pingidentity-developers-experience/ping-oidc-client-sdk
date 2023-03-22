import * as crypto from 'crypto';
import { Logger, OAuth } from '../src/utilities';
import { TestHelpers } from './utilities';

describe('OAuth', () => {
  let windowSpy;

  beforeAll(() => {
    TestHelpers.initTextEncoder();
  });

  beforeEach(() => {
    // Set up all the stuff needed on the window object for
    // the generateCodeChallenge method to run successfully.
    // eslint-disable-next-line no-undef
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      crypto: {
        subtle: crypto.webcrypto.subtle,
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  describe('btoa', () => {
    it('should base64 encode string', () => {
      expect(OAuth.btoa('Hello World!')).toBe('SGVsbG8gV29ybGQh');
    });
  });

  describe('atob', () => {
    it('should decode base64 string', () => {
      expect(OAuth.atob('SGVsbG8gV29ybGQh')).toBe('Hello World!');
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate code challenge from code verifier', async () => {
      const codeVerifier = 'ABCDEF12345';
      const codeChallenge = await OAuth.generateCodeChallenge(codeVerifier);

      // Send codeVerifier through the form here https://tonyxu-io.github.io/pkce-generator/
      expect(codeChallenge).toBe('B6qi8EPWVTnONnO8XNSAsN7O2ejthn3pCKwZUO0HzU8');
    });
  });

  describe('getRandomString', () => {
    it('should generate a random string of the correct length', () => {
      let generatedStr = OAuth.getRandomString(12);
      expect(generatedStr.length).toBe(12);

      generatedStr = OAuth.getRandomString(20);
      expect(generatedStr.length).toBe(20);
    });
  });

  describe('generatePkceArtifacts', () => {
    it('should generate a 20 character state string', async () => {
      const options = {
        // Not used generatePkceArtifacts
        clientId: '',
        redirectUri: '',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.state.length).toBe(20);
    });

    it('should generate a 10 character nonce string', async () => {
      const options = {
        // Not used generatePkceArtifacts
        clientId: '',
        redirectUri: '',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.nonce.length).toBe(10);
    });

    it('should generate a 128 code verifier string', async () => {
      const options = {
        clientId: '',
        redirectUri: '',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.codeVerifier.length).toBe(128);
    });

    it('should generate a code challenge if usePkce is true', async () => {
      const options = {
        clientId: '',
        redirectUri: '',
        usePkce: true,
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.codeChallenge?.length).toBeGreaterThan(0);
    });

    it('should pass string state through', async () => {
      const options = {
        clientId: '',
        redirectUri: '',
        state: 'teststate',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.state).toBe('teststate');
    });

    it('should pass object state through as a string', async () => {
      const options = {
        clientId: '',
        redirectUri: '',
        state: { test: 'value' },
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.state).toBe('{"test":"value"}');
    });
  });
});
