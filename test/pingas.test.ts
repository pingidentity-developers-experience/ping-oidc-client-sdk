import { OAuth } from '../src/utilities';
import PingAsOidc from '../src/pingas';
import { ResponseType } from '../src/types';

// Mock fetch call to token endpoint
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ access_token: 'testtoken', id_token: 'testtoken' }),
  }),
) as jest.Mock;

describe('pingas', () => {
  afterEach(() => {
    // Reset spys
    jest.clearAllMocks();
  });

  describe('authorize', () => {
    it('should return a URL without PKCE artifacts', async () => {
      const pAS = new PingAsOidc({ BasePath: 'https://example.ping-devops.com' });
      const authzURL = await pAS.authorize({ ClientId: 'ac_client', RedirectUri: 'https://localhost', PkceRequest: false });
      expect(authzURL).toEqual(expect.not.stringContaining('code_challenge='));
      expect(authzURL).toEqual(expect.not.stringContaining('state='));
    });

    it('should return a URL with PKCE artifacts', async () => {
      const pAS = new PingAsOidc({ BasePath: 'https://example.ping-devops.com' });

      const mockGeneratePkceArtifacts = jest.spyOn(OAuth, 'generatePkceArtifacts').mockResolvedValue({
        CodeVerifier: 'randomstring',
        CodeChallenge: 'randomstring',
        CodeChallengeMethod: 'S256',
        State: 'randomstring',
      });

      const authzURL = await pAS.authorize({ ClientId: 'ac_client', RedirectUri: 'https://localhost', PkceRequest: true });
      expect(mockGeneratePkceArtifacts).toHaveBeenCalledTimes(1);
      expect(authzURL).toEqual(expect.stringContaining('state='));
      expect(authzURL).toEqual(expect.stringContaining('code_challenge='));
      expect(authzURL).toEqual(expect.stringContaining('code_challenge_method='));
    });

    it('should return a URL without PKCE artifacts and console warn ResponseType mismatch', async () => {
      const pAS = new PingAsOidc({ BasePath: 'https://example.ping-devops.com' });

      const mockGeneratePkceArtifacts = jest.spyOn(OAuth, 'generatePkceArtifacts').mockResolvedValue({
        CodeVerifier: 'randomstring',
        CodeChallenge: 'randomstring',
        CodeChallengeMethod: 'S256',
        State: 'randomstring',
      });

      const authzURL = await pAS.authorize({ ClientId: 'ac_client', RedirectUri: 'https://localhost', PkceRequest: true, ResponseType: ResponseType.Implicit });
      expect(mockGeneratePkceArtifacts).toHaveBeenCalledTimes(0);
      expect(authzURL).toEqual(expect.not.stringContaining('state='));
      expect(authzURL).toEqual(expect.not.stringContaining('code_challenge='));
      expect(authzURL).toEqual(expect.not.stringContaining('code_challenge_method='));
    });

    it('should return a URL with PKCE artifacts without code_challenge_method', async () => {
      const pAS = new PingAsOidc({ BasePath: 'https://example.ping-devops.com' });

      const mockGeneratePkceArtifacts = jest.spyOn(OAuth, 'generatePkceArtifacts').mockResolvedValue({
        CodeVerifier: 'randomstring',
        CodeChallenge: 'randomstring',
        CodeChallengeMethod: '',
        State: 'randomstring',
      });

      const authzURL = await pAS.authorize({ ClientId: 'ac_client', RedirectUri: 'https://localhost', PkceRequest: true });
      expect(mockGeneratePkceArtifacts).toHaveBeenCalledTimes(1);
      expect(authzURL).toEqual(expect.stringContaining('state='));
      expect(authzURL).toEqual(expect.stringContaining('code_challenge='));
      expect(authzURL).toEqual(expect.not.stringContaining('code_challenge_method='));
    });
  });

  describe('getToken', () => {
    it('should return an object with access token and id token', async () => {
      const pAS = new PingAsOidc({ BasePath: 'https://example.ping-devops.com' });
      const tokenResponse = await pAS.getToken('12345', 'https://localhost', 'test_client', 'recset');
      expect(tokenResponse).toHaveProperty('access_token');
      expect(tokenResponse).toHaveProperty('id_token');
    });
  });
});
