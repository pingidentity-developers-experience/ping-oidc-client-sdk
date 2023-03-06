import * as crypto from 'crypto';
import { ClientOptions } from '../src/types';
import { Logger, OAuth } from '../src/utilities';
import { Helpers } from './utilities';

describe('OAuth', () => {
  let windowSpy: any;

  beforeAll(() => {
    Helpers.initTextEncoder();
  });

  beforeEach(() => {
    // Set up all the stuff needed on the window object for
    // the generateCodeChallenge method to run successfully.
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
      const options: ClientOptions = {
        // Not used generatePkceArtifacts
        clientId: '',
        redirectUri: '',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.state.length).toBe(20);
    });

    it('should generate a 128 code verifier string', async () => {
      const options: ClientOptions = {
        clientId: '',
        redirectUri: '',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.codeVerifier.length).toBe(128);
    });

    it('should generate a code challenge', async () => {
      const options: ClientOptions = {
        clientId: '',
        redirectUri: '',
      };

      const artifacts = await OAuth.generatePkceArtifacts(options, new Logger());

      expect(artifacts.codeChallenge.length).toBeGreaterThan(0);
    });

    // it(`should default to empty code challenge method and warn user if invalid`, async () => {
    //   const logger = new Logger();
    //   const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

    //   // Not all users will be using TypeScript necessarily, so setting to any so
    //   // we can set an invalid CodeChallengeMethod for testing
    //   const options: any = {
    //     // Not used generatePkceArtifacts
    //     clientId: '',
    //     redirectUri: '',
    //     codeChallengeMethod: 'S259',
    //   };

    //   const artifacts = await OAuth.generatePkceArtifacts(options, logger);

    //   expect(artifacts.codeChallengeMethod).toBeUndefined();
    //   expect(loggerSpy).toHaveBeenCalled();
    // });
  });
});
