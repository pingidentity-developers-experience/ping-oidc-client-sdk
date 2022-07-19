import PingOneOidc from '../src/pingone';

describe('pingone', () => {
  describe('authorize', () => {
    it('should set a default auth path if one is not sent', () => {
      const p1 = new PingOneOidc({ PingOneAuthPath: '', PingOneEnvId: '' });
      expect(p1['pingOneAuthPath']).toBe('https://auth.pingone.com/');
    });

    it('should throw error if PingOneEnvId is not set', async () => {
      const p1 = new PingOneOidc({ PingOneAuthPath: '', PingOneEnvId: '' });

      const loggerSpy = jest.spyOn(p1['logger'], 'error').mockImplementation(() => {});

      await expect(async () => {
        await p1.authorize({ ClientId: '', RedirectUri: '' });
      }).rejects.toThrow('You must provide a PingOneEnvId through the constructor to authorize');

      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
